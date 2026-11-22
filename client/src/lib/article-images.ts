const ARTICLE_IMAGE_WIDTHS = [320, 640, 960, 1200, 1600] as const;
const DEFAULT_IMAGE_WIDTH = 1200;

export interface ArticleImageSources {
  src: string;
  srcSet?: string;
}

export function getArticleImageSources(src: string): ArticleImageSources {
  try {
    const url = new URL(src);
    if (url.hostname !== "res.cloudinary.com") {
      return { src };
    }

    const uploadMarker = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) {
      return { src };
    }

    const pathAfterUpload = url.pathname.slice(uploadIndex + uploadMarker.length);
    const firstSegment = pathAfterUpload.split("/")[0];
    if (/^(?:f_(?:auto|jpg|jpeg|png|webp)|q_(?:auto|\d+)|w_\d+|h_\d+|c_(?:limit|fill|scale|crop))(?:,|$)/i.test(firstSegment)) {
      return { src };
    }

    const urlForWidth = (width: number) => {
      const responsiveUrl = new URL(url);
      responsiveUrl.pathname =
        `${url.pathname.slice(0, uploadIndex + uploadMarker.length)}` +
        `f_auto,q_auto,c_limit,w_${width}/${pathAfterUpload}`;
      return responsiveUrl.toString();
    };

    return {
      src: urlForWidth(DEFAULT_IMAGE_WIDTH),
      srcSet: ARTICLE_IMAGE_WIDTHS
        .map((width) => `${urlForWidth(width)} ${width}w`)
        .join(", "),
    };
  } catch {
    return { src };
  }
}

export function optimizeArticleContentImages(content: string): string {
  if (typeof DOMParser === "undefined") {
    return content;
  }

  const document = new DOMParser().parseFromString(content, "text/html");
  document.querySelectorAll("img[src]").forEach((image) => {
    const sources = getArticleImageSources(image.getAttribute("src") || "");
    image.setAttribute("src", sources.src);
    if (sources.srcSet) {
      image.setAttribute("srcset", sources.srcSet);
      image.setAttribute("sizes", "(min-width: 1024px) 768px, 100vw");
    }
    image.setAttribute("loading", "lazy");
    image.setAttribute("decoding", "async");
  });

  return document.body.innerHTML;
}

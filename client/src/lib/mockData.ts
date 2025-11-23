import { format } from "date-fns";

export interface Article {
  id: number;
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  timestamp: string;
  isBreaking?: boolean;
  featured?: boolean;
}

export const CATEGORIES = ["All", "Politics", "Business", "Sports", "Entertainment", "Tech", "Counties"];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "Government Launches New Infrastructure Project in Central Region",
    content: "The government has today unveiled a massive infrastructure plan aimed at boosting the economy of the central region. The project, which includes road expansions and new market centers, is expected to create thousands of jobs... (Full article content would go here)",
    image: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80&w=1000",
    category: "Politics",
    author: "James Mwangi",
    timestamp: new Date().toISOString(),
    featured: true
  },
  {
    id: 2,
    title: "Tech Hubs Sprouting in Nyeri: A New Silicon Savannah?",
    content: "Nyeri County is quickly becoming a hotspot for technology startups. With new innovation hubs opening up, local youth are finding opportunities in software development and digital marketing...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000",
    category: "Tech",
    author: "Sarah Kimani",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isBreaking: false
  },
  {
    id: 3,
    title: "Coffee Farmers Expect Record Bonuses This Year",
    content: "Good news for coffee farmers as global prices surge. The local cooperative societies have announced that the upcoming bonus payments will be the highest in a decade...",
    image: "https://images.unsplash.com/photo-1612545667889-b320b938412a?auto=format&fit=crop&q=80&w=1000",
    category: "Business",
    author: "Peter Kamau",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    featured: true
  },
  {
    id: 4,
    title: "Local Team Qualifies for National Championships",
    content: "The Mount Kenya United football team has secured a spot in the national championships after a thrilling 2-1 victory over their rivals...",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1000",
    category: "Sports",
    author: "Brian Ochieng",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isBreaking: true
  },
  {
    id: 5,
    title: "Cultural Festival Attracts Thousands to Meru",
    content: "The annual cultural festival held in Meru this weekend was a resounding success, showcasing traditional music, dance, and food...",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e3720?auto=format&fit=crop&q=80&w=1000",
    category: "Entertainment",
    author: "Alice Wanjiku",
    timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
  {
    id: 6,
    title: "New County Bylaws to Effect Small Businesses",
    content: "Small business owners are reviewing the new bylaws passed by the county assembly yesterday. The regulations aim to streamline licensing...",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000",
    category: "Counties",
    author: "John Doe",
    timestamp: new Date(Date.now() - 20000000).toISOString(), 
  }
];

export const MOCK_STATS = {
  totalArticles: 142,
  totalCategories: 7,
  activeUsers: 89,
  recentPosts: 12
};

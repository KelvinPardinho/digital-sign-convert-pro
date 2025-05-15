
export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  date: string;
  author: Author;
  category: string;
  readingTime: number;
}

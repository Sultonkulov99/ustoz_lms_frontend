export type CommentItem = {
  id: string;
  content: string;
  rating: number;
  date?: string;
  hasActions?: boolean;
};

export type CommentGroup = {
  id: string;
  authorName: string;
  comments: CommentItem[];
};

export type CommentFormData = {
  authorName: string;
  content: string;
  rating: number;
  date?: string;
  hasActions?: boolean;
};

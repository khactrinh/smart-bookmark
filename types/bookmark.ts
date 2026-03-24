export type Bookmark = {
    _id: string;
    title: string;
    url: string;
    description?: string;
    category?: string;
    tags?: string[];
    image?: string;
};
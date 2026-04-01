export type Bookmark = {
    _id: string;
    title: string;
    url: string;
    description?: string;
    category?: string;
    tags?: string[];
    image?: string;
    collectionIds?: string[];
};

export type Collection = {
    _id: string;
    name: string;
    description?: string;
    userEmail: string;
    shareId?: string;
};
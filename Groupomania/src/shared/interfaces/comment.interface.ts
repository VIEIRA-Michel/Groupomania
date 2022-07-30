export interface Comment {
    publication_id: number;
    publication_content: string;
    publication_picture?: string;
    user_id: number;
    publication_created: string;
    publication_updated_at?: string;
    lastname: string;
    firstname: string;
    email: string;
    role_id: number;
    account_disabled?: boolean;
    comment_id: number;
    comment_user_id: number;
    comment_publication_id: number;
    comment_content: string;
    comment_created_at: string;
}
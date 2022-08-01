export interface Publication {
    account_disabled?: boolean,
    birthday?: string | null,
    content: string,
    created_at: string,
    editMode: boolean,
    email?: string,
    firstname?: string,
    gender_id?: number | null,
    id?: number,
    lastname?: string,
    picture?: string, 
    publication_created: string, 
    updated_at: null | string,
    publication_id: number,
    recipient_approveDate?: null | string,
    recipient_deniedDate?: null | string,
    recipient_requestDate?: null | string,
    recipient_requestId?: null | number, 
    recipient_senderId?: null | number,
    recipient_userId?: null | number, 
    role_id?: number,
    sender_approveDate?: null | string,
    sender_deniedDate?: null | string, 
    sender_requestDate?: null | string,
    sender_recipientId?: null | number,
    sender_requestId?: null | number, 
    sender_userId?: null | number,
    user_id: number,
    newContent?: string | null,
    newPicture?: string | null,
    likes?: [] | null,
    numberOfLikes?: number | null,
    numberOfComments?: number | null,
}

// export interface Publication {
//     publication_id: number;
//     content: string;
//     picture?: string;
//     user_id: number;
//     publication_created: string;
//     updated_at?: string;
//     editMode: boolean;
//     done: boolean;
// }

/**
 * 文字类型
 */
export enum PostBodyType {
    HTML = 'html',
    MD = 'markdown',
}

/**
 * 文字排序字段
 */
export enum OrderField {
    CREATED = 'createtAt',
    UPDATED = 'updatedAt',
    PUBLISHED = 'publishedAt',
    CUSTOM = 'custom',
    COMMENTCOUNT = 'commentCount',
    // LIKE = 'likeCounts',
    // HATE = 'hateCounts'
}

export const respDto = (data, error, meta = {}) => {
    return {data , error, meta}
}

export const metaDto = (total, page, per_page) => {
    return {total , page, per_page, page_count: Math.ceil(total/per_page)}
}
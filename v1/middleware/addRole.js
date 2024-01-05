export const AddAdminRole = (req, res, next) => {
    req.role = 'admin'
    next();
};

export const AddUserRole = (req, res, next) => {
    req.role = 'user'
    next();
};

class UserDto{
    id;
    username;
    roles;
    avatar
    constructor(model) {
        this.id = model._id;
        this.username = model.username;
        this.roles = model.roles;
        this.avatar = model.avatar
    }
    }
export default  UserDto
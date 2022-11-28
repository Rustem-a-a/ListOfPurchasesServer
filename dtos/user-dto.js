class UserDto{
    id;
    username;
    roles;
    avatar;
    isActivated;
    constructor(model) {
        this.id = model._id;
        this.username = model.username;
        this.roles = model.roles;
        this.avatar = model.avatar
        this.isActivated = model.isActivated
    }
    }
export default  UserDto
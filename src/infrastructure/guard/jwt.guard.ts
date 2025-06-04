import { AuthGuard } from "@nestjs/passport";

export class Jwtguard extends  AuthGuard('jwt'){
    constructor(){
        super();
    }
}
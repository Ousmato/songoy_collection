import { Injectable } from "@angular/core";
import { getUserFromSessionStorage } from "../../admin/shared/auth.util";
import { EnumMethodes } from "./util-methode";
import { LoginType, LoginTypeKey } from "../model/util.enum";

@Injectable({
    providedIn: 'root'
})
export class BottomMenue {
    static getMenueItem(): Menues[] {
        const user = getUserFromSessionStorage();
        const role = user?.loginType as LoginType
        const isAdmin = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.ADMIN) as LoginType;
        const isPersonnel = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.PERSONAL) as LoginType;
        // const isUser = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.PERSONAL) as LoginType;
        // console.log(isPatrimoin, "patrimoine")
        if (isAdmin) {
            return this.getAdminMenu();
        } else if (isPersonnel) {
            return this.getPersonnelMenu()
        } else {
            return this.getUserMenue();
        }
    }
    static getMenueDefautItem(): Menues {
        const user = getUserFromSessionStorage();
        const role = user?.loginType as LoginType
        const isAdmin = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.ADMIN) as LoginType;
        //const isPersonnel = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.PERSONAL) as LoginType;
        // const isUser = role === EnumMethodes.getEnumKeyByValue(LoginType, LoginType.PERSONAL) as LoginType;
        // console.log(isPatrimoin, "patrimoine")
        if (isAdmin) {
            return this.getAdminDefaultPath();
        // } else if (isPersonnel) {
        //     return this.getPersonnelDefaultPath()
        } else {
            return this.getCaissierDefaultPath();
        }
    }
    static getAdminMenu(): Menues[] {
        return [
            {
                icon: 'fa-solid fa-gauge-high',
                label: 'Dashboard',
                path: '/admin/dashboard'
            },
            {
                icon: 'fa-solid fa-cash-register',
                label: 'Ventes',
                path: '/admin/list-ventes'
            },
            {
                icon: 'fa-solid fa-cubes-stacked',
                label: 'Stock',
                path: '/admin/list-stock'
            },
            {
                icon: 'fa-solid fa-clipboard-list',
                label: 'Commande',
                path: '/admin/list-commandes'
            },
            {
                icon: 'fa-solid fa-users',
                label: 'Personnel',
                path: '/admin/list-personnel'
            },
            {
                icon: 'fa-solid fa-gear',
                label: 'Settings',
                path: '/admin/list-paramettre'
            },
        ];
    }
    static getPersonnelMenu(): Menues[] {
        return [
            
            {
                icon: 'fa-solid fa-users',
                label: 'Personnel',
                path: '/admin/list-personnel',
            },
        ]
    }
    static getUserMenue(): Menues[] {
        return [
            {
                icon: '',
                label: '',
                path: ''
            },
            {
                icon: '',
                label: '',
                path: ''
            },


        ]
    }
    static getAdminDefaultPath(): Menues {
        return {
            icon: 'fa-solid fa-gauge-high',
            label: 'Tableau de bord',
            path: '/admin/dashboard'
        }
    }
    static getPersonnelDefaultPath(): Menues {
        return {
            icon: 'fa-solid fa-gauge-high',
            label: 'Personnels',
            path: '/admin/list-personnel'
        }
    }
    static getCaissierDefaultPath(): Menues {
        return {
            icon: 'fa-solid fa-gauge-high',
            label: 'Tableau de bord',
            path: '/admin/dashboard'
        }


    }

    static getDefaultPath(loginType: LoginTypeKey): string {

        const admin =
            EnumMethodes.getLoginTypeKey(LoginType.ADMIN);

        // const personnel =
        //     EnumMethodes.getLoginTypeKey(LoginType.PERSONAL);

        const caissier =
            EnumMethodes.getLoginTypeKey(LoginType.CAISSIER);


        if (loginType === admin) {
            return this.getAdminDefaultPath().path;
        }

        if (loginType === caissier) {
            return this.getCaissierDefaultPath().path;
        }

        // if (loginType === caissier) {
        //   return this.getCaissierDefaultPath().path;
        // }

        return '/admin/login';
    }

}

export interface Menues {
    icon: string
    label: string
    path: string
    children?: Menues[]
}

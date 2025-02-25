//Without a defined matxher, this one line applies next-auth to entire project
export {default} from 'next-auth/middleware'

//apply next-auth only yo matching routes
export const config = {matcher: ["/extra", "/dashboard"]}


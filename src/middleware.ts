// Without a defined matcher, this one line applies
// next-auth to the entire project
// nextauth will be applied to all pages, meaning you will
// not be able to access any of the pages if you are not logged in

export { default } from "next-auth/middleware";

// here is a matcher that cause next-auth to only be applied to these routes

export const config = { matcher: ["/racktrack/:path*", "/landing"] }


// import { withAuth } from "next-auth/middleware"

// export default withAuth({
//   // Matches the pages config in `[...nextauth]`
//   pages: {
//     signIn: "/login",
//     error: "/error",
//   },
// })
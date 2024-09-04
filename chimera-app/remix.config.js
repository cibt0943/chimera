/** @type {import('@remix-run/dev').AppConfig} */
export default {
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  // ignoredRouteFiles: ['**/.*'],
  tailwind: true,
  postcss: true,
  serverDependenciesToBundle: [/^react-icons/],
}

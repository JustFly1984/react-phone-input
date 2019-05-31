const path = require("path")

module.exports = {
  ignore: ["**/*.js", "**/*.ts"],
  propsParser: require("react-docgen-typescript").withCustomConfig('./tsconfig.json').parse,
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, ".tsx")
    return `import { ${name} } from '@react-google-maps/api';`
  },
  usageMode: "expand",
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.ts|\.tsx$/,
          loader: "awesome-typescript-loader"
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    }
  },
  sections: [
    {
      name: "Introduction",
      content: "src/docs/introduction.md"
    },
    {
      name: "Getting Started",
      content: "src/docs/getting-started.md"
    },
    {
      name: "Components",
      components: [
        "src/ReactPhoneInput.tsx"
      ]
    }
  ]
}

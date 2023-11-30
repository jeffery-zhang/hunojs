import * as cheerio from 'cheerio'
import nunjucks from 'nunjucks'

import defaultImgTemplate from '../../template/markup/image.html'

export const replaceImgElement = (html, config) => {
  const imgTemplate = getImgTemplate(config)
  if (imgTemplate) {
    const $ = cheerio.load(html)
    const $img = $('img')

    $img.each((index, ele) => {
      const newImgHtml = nunjucks.renderString(imgTemplate, {
        ...ele.attribs,
        ...config.pageParams,
      })
      const $newImg = $(newImgHtml)
      $(ele).replaceWith($newImg)
    })
    return $.html()
  }

  return html
}

const getImgTemplate = (config) => {
  if (config.template === 'default') {
    return defaultImgTemplate
  }
  const filePath = path.join(
    config.rootPath,
    `${config.templateDir}/${config.template}/${templateName}.html`,
  )
  try {
    const imgTemplate = fs.readFileSync(filePath, 'utf-8')
    return imgTemplate
  } catch (err) {
    return ''
  }
}

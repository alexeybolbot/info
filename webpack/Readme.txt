  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack --mode development",
    "build": "cross-env NODE_ENV=production webpack --mode production",
    "watch": "cross-env NODE_ENV=development webpack --mode development --watch",
    "start": "cross-env NODE_ENV=development webpack-dev-server --mode development",
    "stats": "webpack --json > stats.json && webpack-bundle-analyzer stats.json"
  }

  NODE_ENV на разных ОС добавляется по разному. cross-env помогает это решить.

  dev - собрать проект в режиме разработчика.
  build - собрать проект для продакшена.
  watch - собрать проект в режиме разработчика + не надо пересобирать.
  start - собрать проект в режиме разработчика + не надо пересобирать + не надо обновлять страницу в браузере.	
  stats - графическое отображение анализа проекта.

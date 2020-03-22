const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerseWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin  } = require('webpack-bundle-analyzer');

const isDev =  process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
    const config = {
        splitChunks: {
            // Указывает, какие чанки будут выбраны для оптимизации.
            // Мы импортировали jquery в ndex и analytics. Если не использвать chunks: 'all',
            // то код библиотеки jquery будет в двух файлах, что плохо отразиться 
            // на производительности. Благодаря chunks: 'all', код сторонней 
            // библиотеки не будет дублироваться.
            chunks: 'all'
        }
    };

    // Использовать эти плагины в продакшен. При разработке эти плагины не используем,
    // чтобы видеть полноценный код, а не минимизированный.
    if (isProd) {
        config.minimizer = [
            // Плагин Webpack для оптимизации \ минимизации CSS-ресурсов.
            new OptimizeCssAssetWebpackPlugin(),
            // Этот плагин использует terser для минимизации JavaScript.
            new TerseWebpackPlugin()
        ]
    }

    return config;
};

// Даём название файлу. в скобках [] паттерн. 
// [hash] - в имени будет хеш, с изменением файла он будет меняться.
// т.к. браузер кеширует файлы по имени, и чтобы пользователь увидел изменения,
// в имени файла содержится хеш, который при каждом изменении будет менятся. 
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                // only enable hot in development
                // hmr - автоматическое изменение css при разработке.
                hmr: isDev,
                // if hmr does not work, this is a forceful method.
                reloadAll: true
            }
        },
        // css-loader позволяет импортировать css в js
        'css-loader'
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
};

const babelOptions = preset => {
    const opts = {
        // Преобразует новый js в старый.
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            // Для работы со свойсвами в классе.
            '@babel/plugin-proposal-class-properties'
        ]
    };

    if (preset) {
       opts.presets.push(preset); 
    }

    return opts;
};

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }];

    // В режиме разработчика используем eslint. 
    // ESLint - это инструмент статического анализа кода для выявления проблемных шаблонов, обнаруженных в коде JavaScript.
    if (isDev) {
        loaders.push('eslint-loader');
    } 

    return loaders;
};

const plugins = () => {
    const base = [
        // Создаёт html файл. Автоматически из output добавляет файлы в html.
        new HTMLWebpackPlugin({
            // HTMLWebpackPlugin создаёт html с пустым body.
            // template путь к шаблону.
            template: './index.html',
            // Каким образом вывод должен быть минимизирован.
            minify: {
                // Эта опция сворачивает пробелы, которые вносят вклад в текстовые узлы в дереве документа.
                collapseWhitespace: isProd
            }
        }),
        // По умолчанию этот плагин удаляет все файлы в каталоге веб-пакета output.path,
        // а также все неиспользуемые ресурсы веб-пакета после каждой успешной перестройки.
        // Если не использовать этот плагин, в папке dist будут добавляться, во время разработки, новые файлы с разным хешем,
        // а старые не будут удаляться. Этот плагин удаляет все старые файлы, которые не используются.
        new CleanWebpackPlugin(),
        // Копирует отдельные файлы или целые каталоги, которые уже существуют, в каталог сборки.
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        // Этот плагин извлекает CSS в отдельные файлы. Он создает файл CSS для каждого файла JS,
        // который содержит CSS. Он поддерживает загрузку по требованию CSS и SourceMaps.
        // Без него css добавляется в секцию head в html.
        new MiniCssExtractPlugin({
            filename: filename('css')
        })  
    ];

    if (isProd) {
        // Визуализация размера выходных файлов webpack с интерактивной масштабируемой древовидной картой.
        base.push(new BundleAnalyzerPlugin());
    }

    return base;
};

module.exports = {
    // путь к исходникам. Если не использвать, то в путях везде пришлось бы добавлять ./src
    // context принимает абсолютный путь, поэтому добавляем __dirname.
    context: path.resolve(__dirname, 'src'),
    // Установив для mode параметра либо development, production либо none, 
    // вы можете включить встроенные оптимизации веб-пакета, соответствующие каждой среде. 
    // Значением по умолчанию является production.
    mode: 'development',
    // Точка входа указывает на то, какой модуль WebPack должен использовать,
    // чтобы начать строить свой внутренний граф зависимостей. Webpack выяснит,
    // от каких других модулей и библиотек зависит эта точка входа (прямо или косвенно). 
    entry: {
        // index.js основной файл, в который импортируются другие файлы - js, css, json и т.д.
        // analytics в index.js не импортируется, но в index.html добавлется, как сторонний скрпит.
        // на выходе в index.html у нас будет добавлено два скрипта - 
        // <script type="text/javascript" src="main.js"> и <script type="text/javascript" src="analytics.js"></script>.
        // @babel/polyfill позволяет использовать новые встроенные модули, такие как Promise или WeakMap, статические методы, 
        // такие как Array.from или Object.assign, методы экземпляра, такие как Array.prototype.includes, и функции генератора.
        main: ['@babel/polyfill', './index.jsx'],
        analytics: './analytics.ts'
    },
    // Свойство output сообщает webpack, куда отправлять создаваемые пакеты и как называть эти файлы. 
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },

    // работа с модулями
    resolve: {
        // extensions позволяет пользователям отключать расширение при импорте.
        extensions: ['.js', '.json', '.png'],
        // alias создаёт псевдонимы import или require
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    // webpack версии 4 выполняет оптимизацию в зависимости от выбранного mode, 
    // всё же все оптимизации доступны для ручной настройки и переопределений.
    optimization: optimization(),
    // devServer выбирается webpack-dev-server и может использоваться для изменения его поведения.
    // webpack-dev-server может быть использован для быстрой разработки приложения. 
    // При нём не надо пересобирать проект и не надо обновлять страницу в браузере.
    devServer: {
        port: 4200,
        hot: isDev
    },
    // Контролирует, как генерируются исходные карты.
    // Возмность в браузере видеть код который мы написали, а не изменённый, минифицированный. Так же стили.
    devtool: isDev ? 'source-map' : '',
    // plugins опция используется для настройки процесса сборки веб-пакета различными способами.
    plugins: plugins(),
    module: {
        // rules описывает тип Loaders. 
        // webpack понимает только файлы JavaScript и JSON. Loaders позволяют веб-пакетам обрабатывать файлы других типов
        // и преобразовывать их в допустимые модули.
        rules: [
            {
                // test - регулярное выражение, с помощью которого смотрят тип файла.
                // use - указывает, какие Loaders должны быть использованы для преобразования.
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.js$/,
                // exclude - не учитываем
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions('@babel/preset-react')
                }
            }
        ]
    }
}
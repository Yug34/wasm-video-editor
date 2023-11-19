module: {
    rules: [
        {
            test: /\.(mp4|webm|wmv)$/,
            use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'videos/',
                },
            },
        },
    ]
}
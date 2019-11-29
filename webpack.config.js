	// 设定当前文件所在位置为根目录
	const path = require('path');

	module.exports = {
	    // 切入点
	        // a) 设定监控文件 ( "./"为当前目录的意思 )
	        // b) 注意: 多js文件绑定时需 import/export配合
	    entry: './index.html', 
	    
	    // 输出点
	        // a) path: 为设定生成路径
	            // a) __dirname：为生成文件的设定的权限
	            // b) ‘dist/js’: 为生成的js文件路径
	        // b) filename: 为设定生成文件名称
	    output:{
	        path: path.resolve( __dirname, './' ),
	        filename: 'test.html'    
        },
        
        devServer:{
            contentBase: './'
        },

	
	};

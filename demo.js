//<!--木桶布局-->
(function($){
	$.fn.flexImages = function(options)
	{
		var content = $.extend({container:'.pic', object:'img' ,rowHeight:0}, options);
		this.each(function()
		{
			var block = $(this), containers = $(block).find(content.container), items=[];   //定义一个block装下所有的信息，用containers取出所有图片。
			var style = window.getComputedStyle ? getComputedStyle(containers[0], null) : containers[0].currentStyle;
            content.margin = (parseInt(style.marginLeft) || 0) + (parseInt(style.marginRight) || 0) + (parseInt(style.borderLeftWidth)) || 0 + (parseInt(style.borderRightWidth) || 0);
			for (i=0;i<containers.length;i++)
			{
				var c = containers[i];
				var w = parseInt(c.getAttribute('data-w'));
				var calcu_w = w * content.rowHeight/parseInt(c.getAttribute('data-h'));   //计算比例缩小后的宽度。
				var obj = $(c).find(content.object);
				items.push([c,w,calcu_w,obj,obj.data('src')]);    //把这一大堆信息给items
			}
			mapping(block,items,content);  
		});
	}


	//<!--绘图-->
	function mapping(block,items,content)
	{
		var row=[];
		var maxWidth = block.width();                   //这一行能承受的最大宽度 
		var rowWidth=0;   //这一行插入图片以后的宽度
		var totalmargin;
		var newWidth;
		var j;
		   
		for(i=0;i<items.length;i++)
		{
			row.push(items[i]);           //在这一行后面加上第i+1张图
			rowWidth = rowWidth + items[i][2] + content.margin;         //现在的行宽是原行宽+这张图的比例缩小宽度+ margin
			
			//<!--这一行最后一幅图的处理-->
			if(rowWidth >= maxWidth)
			{
				var newWidth;
				totalmargin = row.length*content.margin;
				var newratio; 
				newratio = (maxWidth-totalmargin)/(rowWidth-totalmargin);             //计算这一行的图片重新压缩的比例
				for(j=0;j<row.length;j++)
				{
					newWidth = row[j][2]*newratio;                        //重新计算每个div的宽度
					if (row[j][4]) 
					{ 
						row[j][3].attr('src', row[j][4]); 
						row[j][4] = ''; 
					}
					row[j][0].style.width = newWidth +'px';
					row[j][0].style.height = content.rowHeight*newratio +'px';
					row[j][0].style.display = 'block';
				}			
				//reset
				row = [];
				rowWidth = 0;
			}

			//<!--如果最后一行不满行-->
			if(i==(items.length-1)&&rowWidth < maxWidth)
			{
				for(j=0;j<row.length;j++)
				{
					row[j][0].style.width = row[j][2]+'px';
					row[j][0].style.height = content.rowHeight +'px';
					row[j][0].style.display = 'block';
				}
			}
		}		
	}
}(jQuery));




//<!--主体部分-->
$(document).ready(function(){
	$('.randomimages').flexImages({rowHeight:185});

	//<!--定义弹窗-->
	var popup = '<div class="popup">'+
				'<div class="space"> </div>'+
				'<div class="closer">X</div>'+
				'<div class="picflip" id="prevpic"> < </div>'+
				'<div class="left"></div>'+
				'<div class="right">This is a caption.</div>'+
				'<div class="picflip" id="nextpic"> > </div>'+
				'</div>';

	//<!--给每一行图片加上行数-->
	function addRow() {
		var row=1;
		$('div .pic').each(function(i)          
		{         
			$(this).attr('id',i);              //控制滑动 attr()方法设定元素属性值
			if($(this).prev().length!=0)
			{
				if($(this).position().top!=$(this).prev().position().top)
				{
					row++;
				}
			}
			$(this).attr('data-row',row).addClass('row'+row);
		});
	}

	addRow();


	//<!--浏览器窗口大小变化时的调整-->
	var windowwidth=$(window).width();       //记录现在的窗口宽度
	$(window).on('resize',function(){        //添加resize事件的处理程序
		var newwindowwidth=$(window).width();
		if(newwindowwidth!=windowwidth)
		{
			$('.popup').remove();            //浏览器窗口宽度变化则移除弹窗
			addRow();                        //浏览器窗口宽度变化行数改变需重新计算
		}
	});


	//<!--点击图片popup出现以后的操作-->
	$('.pic').on('click',function(){
		var row = $(this).attr("data-row");
		var popupexist=$('.popup').is(':visible');
		var picindex=$(this).attr('id');
		
		//<!--如果弹窗已经存在则把其删除-->
		if(popupexist){
			$('.popup').remove();            
		}
		
		$('.row'+row+':last').after(popup);  //把弹窗放在这一行最后一张图片后面
		
		//<!--调用图片-->
		var picsrc=$(this).find('img').attr('src');
		$('.popup .left').append('<img src="'+picsrc+'"/>');
		
		//<--点击关闭按钮时弹窗删除-->
		$('.popup').delegate('.closer','click',function(){
			$('.popup').remove();            
		});
		
		//<!--弹窗翻页函数-->
		function slipping(e){
			if(e.target.id=='nextpic')
			{
				var next = parseInt(picindex)+1;       //parseInt 解析字符串并返回整数
				if($('#'+next)){
					$('#'+next).trigger('click');
				}     
			}
			else
			{
				var prev = parseInt(picindex)-1;
				if($('#'+prev)){
					$('#'+prev).trigger('click');
				}
			}
	 	}

	 	//<!--弹窗翻页-->
	 	$('.popup').delegate('.picflip','click',function(e){
	 		slipping(e);
	 	});
    });

   
    //<!--本地上传图片-->
	var filechooser = document.getElementById('filechooser');
 	filechooser.onchange = function() 
	{
    	var files = this.files;
    	var file = files[0];
    	if (!/\/(?:jpeg|jpg|png)/i.test(file.type)) return;      //可以接受 jpeg, jpg, png 类型的图片
    	var reader = new FileReader();
	   	reader.onload = function() 
    	{
        	var result = this.result;
        	var image = new Image();
        	image.src=result;
        	var w,h;
            w = image.width;
        	h = image.height;
           	$('.randomimages').append('<div class="pic" data-w=' +w +' data-h='+h+' ><img src="'+result+'"/></div>');
        	$('.randomimages').flexImages({rowHeight:185});      //重新进行木桶布局
        	filechooser.value = '';                              // 清空图片上传框的值
        	addRow();
    	};
    	reader.readAsDataURL(file);
	};
});



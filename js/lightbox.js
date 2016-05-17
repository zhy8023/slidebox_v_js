var EventUtil = {
    addHandler: function(element, type, handler) {
        if(element.addEventListener) {
            element.addEventListener(type,handler,false);
        } else if (element.attachEvent) {
            element.attachEvent("on"+type,handler);
        } else {
            element["on"+type] = handler;
        }
    },

    getEvent: function(event) {
        return event ? event : window.event;
    },

    getTarget: function(event) {
        return event.target || event.srcElement;
    },

    removeHandler: function(element, type, handler) {
        if(element.removeEventListener) {
            element.removeEventListener(type,handler,false);
        } else if (element.detachEvent) {
            element.detachEvent("on"+type,handler);
        } else {
            elment["on"+type] = null;
        }
    } 
}

function Lightbox() {
    this.container = "";
    this.imageNode = "";
    this.titleNode = "";
    this.currentImageNode = "";
    this.isCreate = false;
    this.init();
}

Lightbox.prototype = {
    //上一张
    toPrev :function(){
        //得到当前图片的索引
        var index = this.images.indexOf(this.currentImageNode);
        //计算下一张图片的索引
        index <= 0 ? index = this.images.length -1 : index--;
        this.goTo(index);
    },
    //下一张
    toNext : function(){
        //得到当前图片的索引
        var index = this.images.indexOf(this.currentImageNode);
        //计算下一张图片的索引
        index >= this.images.length -1 ? index = 0 : index++;
        this.goTo(index);
    },
    //跳转到某一张
    goTo : function(index){
        var imageNode = this.images[index];
        this.show(imageNode);
    },
    //创建幻灯节点
    createNode : function(){
        var _self = this;
        //创建背景
        this.container =document.createElement('div');
        this.container.className = "lightbox-container";
        //对this.container绑定点击退出事件，但不对其子节点进行绑定
        EventUtil.addHandler(this.container,"click",function(e){
            if(e.target == _self.container){
                _self.hide();
            }
        });

        //创建灯箱面板
        var wrapper = document.createElement('div');
        wrapper.className = "lightbox-wrapper";
        this.container.appendChild(wrapper);

        //创建面板下的图片节点
        var imageWrapper = document.createElement('div');
        imageWrapper.className = "lightbox-image-wrapper";
        wrapper.appendChild(imageWrapper);

        //创建图片节点
        this.imageNode = document.createElement('img');
        this.imageNode.className = "lightbox-image";
        imageWrapper.appendChild(this.imageNode);
        /*this.imageNode.setAttribute('src' , 'images/thumb-5.jpg');*/

         //创建左按钮
        var prevNode = document.createElement('span');
        prevNode.className = "lightbox-prev";
        imageWrapper.appendChild(prevNode);
        //绑定上一张按钮事件
        EventUtil.addHandler(prevNode, "click", function(event){
             _self.toPrev();
        });
        
        //创建右按钮
        var nextNode = document.createElement('span');
        nextNode.className = "lightbox-next";
        imageWrapper.appendChild(nextNode);
        //绑定下一张按钮事件
        EventUtil.addHandler(nextNode, "click", function(event){
             _self.toNext();
        });

        //创建面板下的title以及close按钮
        var noteNode = document.createElement('div');
        noteNode.className = "lightbox-note";
        wrapper.appendChild(noteNode);

        //创建标题
        this.titleNode =document.createElement('p');
        this.titleNode.className = "lightbox-title";
        noteNode.appendChild(this.titleNode);

        //创建关闭按钮
        var closeNode = document.createElement('span');
        closeNode.className = "lightbox-close";
        noteNode.appendChild(closeNode);
        //绑定关闭按钮事件
        EventUtil.addHandler(closeNode, "click", function(){
            _self.hide();
        });

        document.body.appendChild(this.container);
        this.isCreate = true;
        //第一次创建的时候将他透明度设为0，执行show方法后背景执行相应动画
        this.container.style.opacity =0;
    },
    //更新函数
    update : function(imageNode){
        var _self = this;
        var images = this.images;
        var imgNode = _self.imageNode;
        /*imageNode = imageNode || this.currentImageNode;
        当使用该条语句的时候，则在对window的resize事件的时候，调用update
        方法不需要传参*/
        
        //得到要显示的图片节点的地址
        var src=imageNode.getAttribute('data-lightbox');
        //在加载完成之前隐藏
        imgNode.style.visibility = "hidden";
        
        this.container.className +=" lightbox-loading";
        //创建一个新的图片节点，计算图片的原始宽高
        var newImg = document.createElement('img');
        newImg.setAttribute('src',src);
        //掩藏当前创建的新图片节点
        newImg.style.cssText = "position:absolute; top:-99999px;"
        EventUtil.addHandler(newImg,'load',function(){
            //计算图片的大小
            var imgWidth = this.offsetWidth;
            var imgHeight = this.offsetHeight;
            //计算浏览器可视窗口大小

            var clientWidth = document.documentElement.clientWidth;
            var clientHeight = document.documentElement.clientHeight;

            //将图片等比例缩小
            var scale = Math.max(imgWidth/clientWidth , imgHeight/clientHeight);
            imgNode.style.width = (scale > 1 ? imgWidth/scale*0.8 :imgWidth ) + "px";
            //设置新的图片
            imgNode.setAttribute('src',src);
            imgNode.style.visibility = "visible";
            //清除图片
            document.body.removeChild(newImg);
            _self.container.className = _self.container.className.replace(" lightbox-loading",'');
        });
        document.body.appendChild(newImg);
        
        //计算图片集合的长度以及当前图片的索引
        var index = images.indexOf(imageNode) + 1;
        this.titleNode.innerHTML = imageNode.getAttribute('title') + "</br>" +index + "/" + images.length;
    },
    //显示创建的幻灯片节点
    show :function(imageNode){
        var _self = this;
        this.isShow = true;
        //创建幻灯片节点并加载到页面
        this.isCreate || this.createNode();
        this.currentImageNode = imageNode;
        //更新图片
        this.update(this.currentImageNode);
        this.container.style.display = "block";
        //设置创建节点的背景动画

        if(this.container.style.opacity === "0" || this.container.style.opacity === "undefined"){
            var min = 0,max = 1;
            var interId = setInterval(function(){
                if (min >= max) {
                    clearInterval(interId);
                    return false;
                }
                min +=0.15;
                _self.container.style.opacity = min;
            },1000/80);
        }
    },
    //掩藏创建的幻灯片节点
    hide :function(){
        this.isShow = false;
        this.container.style.display = "none";
        this.container.style.opacity = 0;
    },
    //初始化函数
    init :function(){
        var _self = this;
        //得到data-lightbox属性的images集合
        var images = document.querySelectorAll('[data-lightbox]');
        //将集合转化为数组
        this.images = Array.prototype.slice.call(images);
        
        //对每张图片进行以及点击事件的绑定
        for(var i=0 ;i < this.images.length;i++){
            EventUtil.addHandler(_self.images[i],"click",(function(i){
                return function(){
                    _self.show(_self.images[i]);}
            })(i));
        };
        //绑定键盘事件
        EventUtil.addHandler(document,'keyup',function(e){
            if(_self.isCreate){
                switch(e.keyCode){
                    case 27 :
                        _self.hide();
                        break;
                    case 37 : 
                        _self.toPrev();
                        break;
                    case 39 : 
                        _self.toNext();
                        break;
                }
            }

        });
        //窗口变化的时候，调整幻灯片的大小
        EventUtil.addHandler(window,'resize',function(){
            _self.isCreate && _self.isShow && _self.update(_self.currentImageNode);
        });
    }
}

new Lightbox();









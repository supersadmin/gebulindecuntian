import {  _decorator, Component, Node, EventTouch, Vec3} from 'cc';
const { ccclass, property } = _decorator;

/**方向盘组件 */
@ccclass('Direction')
export class Direction extends Component {

    /**移动速度级别 */
    level=0
    /**是否点击 */
    touch=false

    start() {

        this.node.on(Node.EventType.TOUCH_MOVE,throttle((e:EventTouch)=>{
            let touchPos = e.touch.getUILocation()
            this.node.setWorldPosition(new Vec3(touchPos.x,touchPos.y))
            const p=this.node.position
            const [x,y,level]=computedDeg(p.x,p.y,100,150)
            this.level=level
            this.node.setPosition(new Vec3(x,y))
            this.touch=true
        },8))

        this.node.on(Node.EventType.TOUCH_END,(e:EventTouch)=>{
            this.node.setPosition(new Vec3(0,0))
            this.level=0
            this.touch=false
        })

        this.node.on(Node.EventType.TOUCH_CANCEL,(e:EventTouch)=>{
            this.node.setPosition(new Vec3(0,0))
            this.level=0
            this.touch=false
        })

    }

    update(deltaTime: number) {
        
    }
}


/**通过滑动的位置来计算移动按钮应该显示的位置 */
const computedDeg = (x: number, y: number,radius:number,radius2:number) => {
    const r=Math.sqrt(x*x+y*y)
    if(Math.abs(x)<5&&Math.abs(y)<5){
        return [0,0,0]
    }else if(r<=radius){
        return[x,y,1]
    }else if(r<radius2){
        return [radius*x/r, radius*y/r,1]
    }else{
        return [radius2*x/r, radius2*y/r,1.4]
    }
}

function throttle(fn:Function,t:number){
    let end=true
    return (...argu)=>{
        if(!end){
            return
        }
        fn(...argu)
        end=false
        setTimeout(()=>end=true,t)
    }
}
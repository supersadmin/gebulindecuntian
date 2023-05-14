import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**该组件添加到节点上 */
@ccclass('SkillCd')
export class SkillCd extends Component {


    /**冷却时间 */
    cd:number=0
    /**文本节点 */
    labelNode:Node=null
    /**文本组件 */
    label:Label=null
    /**精灵图组件 */
    sprite:Sprite=null

    start() {
        this.labelNode=this.node.getChildByName('Label')
        this.label=this.labelNode.getComponent(Label)
        this.labelNode.active=false
        this.sprite=this.getComponent(Sprite)
    }

    /**进入冷却状态 */
    startCooling(cd:number){
        this.cd=cd
        this.sprite.color=new Color(100,100,100)
        this.label.string=String(Math.ceil(this.cd))
        let fn:Function=null
        this.labelNode.active=true
        this.schedule(fn=(dt:number)=>{
            this.cd-=dt
            this.label.string=String(Math.ceil(this.cd))
            if(this.cd<=0){
                this.labelNode.active=false
                this.unschedule(fn)
                this.sprite.color=new Color(255,255,255)
            }
        },0.1)


    }

}



import { _decorator, Color, Component, Node,instantiate, Prefab, Label,Tween, Vec3, UITransform } from 'cc';
import { Role } from '../Role/Role';
import { myFind } from './getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
const { ccclass, property } = _decorator;

/**伤害节点池,用来对节点进行复用 */
const injuryStack:Node[]=[]

/**伤害文本,监听生命值变化 */
@ccclass('InjuryLabel')
export class InjuryLabel extends Component {

    /**生命值降低显示文本的颜色 */
    @property({type:Color})
    injuryColor:Color=new Color(255,0,0,200)

    /**生命值增加显示文本的颜色 */
    @property({type:Color})
    treatmentColor:Color=new Color(152,251,152)

    /**统一管理节点与预制体等资源的组件 */
    manageNode:ManageGame1=null

    /**显示层 */
    injuryLayer:Node=null

    /**伤害节点预制体 */
    injuryPrefab:Prefab=null

    start() {
        this.manageNode=myFind('manageNode')?.getComponent(ManageGame1)
        this.injuryPrefab=this.manageNode.injuryPrefab
        this.injuryLayer=this.manageNode.injuryLayer

        const role=this.getComponent(Role)
        role.onHpChangeAfterFn.add((hp,oldHp)=>this.changeHp(hp-oldHp))
    }

    update(deltaTime: number) {
        
    }

    /**血量发生变化
     * @param val 生命值变化量
     */
    changeHp(val:number){

        let node=injuryStack.length===0?instantiate(this.injuryPrefab):injuryStack.pop()
        
        const label=node.getComponent(Label)
        label.color=val>0?this.treatmentColor:this.injuryColor
        label.string=String(Math.floor(val*10)/10)        
        this.injuryLayer.addChild(node)
        const p=this.node.getWorldPosition()
        const trans=this.getComponent(UITransform)
        node.setWorldPosition(new Vec3(p.x,p.y+trans.height/2))

        new Tween(node)
        .by(0.4,{position:new Vec3(0,50)})
        .call(()=>{
            if(this.isValid){
                this.injuryLayer.removeChild(node)
                injuryStack.push(node)
            }else{
                node.destroy()
            }
        })
        .start()
    }

}



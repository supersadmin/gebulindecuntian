import { _decorator, Component, Node, Prefab,instantiate, UITransform, Vec3,BoxCollider2D, resources } from 'cc';
import { ManageGame1 } from '../manage/ManageGame1';
import { myFind } from './getDirection';

const { ccclass, property,integer } = _decorator;

/**阴影基类 */
@ccclass('Shadow')
export class Shadow extends Component {

    /**统一管理节点与预制体等资源的组件 */
    manageNode: ManageGame1 = null

    @integer
    interval:number=1

    i=0

    /**阴影预制体 */
    shadowPrefab:Prefab=null

    /**阴影层的节点 */
    shadowLayer:Node=null

    /**创建的阴影节点 */
    shadowNode:Node=null

    /**阴影应该处于角色脚底,y轴偏移 */
    offsetY:number=0

    start() {
        this.manageNode=myFind('manageNode')?.getComponent(ManageGame1)
        this.shadowPrefab=resources.get('prefab/shadowRole',Prefab)
        this.shadowLayer=this.manageNode.shadowLayer

        this.shadowNode=instantiate(this.shadowPrefab)
        this.shadowLayer.addChild(this.shadowNode)

        const transform=this.shadowNode.getComponent(UITransform)
        /**此处假设所有节点都有矩形碰撞机 */
        const transform2=this.getComponent(BoxCollider2D)?.size ||  this.getComponent(UITransform)
        transform.height=transform2.height/2.4
        transform.width=transform2.width*1.2
        this.offsetY=transform2.height/2

        this.follow()
        /**角色节点被销毁则阴影节点也随之销毁 */
        this.node.on(Node.EventType.NODE_DESTROYED,()=>this.shadowNode.destroy())
    }

    update() {
        this.follow()
    }

    follow(){
        if((this.i++)%this.interval!==0){return}
        const worldPosition=this.node.getWorldPosition()
        this.shadowNode.setWorldPosition(new Vec3(worldPosition.x,worldPosition.y-this.offsetY))
    }

}



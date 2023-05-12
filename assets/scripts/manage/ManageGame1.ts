import { _decorator, Camera, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**在此处对节点进行统一管理 */
@ccclass('ManageGame1')
export class ManageGame1 extends Component {

    /**玩家角色列表 */
    gamePlayerSet=new Set<Node>()
    
    /**随机获取一名玩家 */
    getRandomGamePlayer():Node{
        const i=Math.floor(this.gamePlayerSet.size*Math.random())
        const t=[...this.gamePlayerSet][i]||null
        if(t===null||t.isValid){
            return t
        }else{
            this.gamePlayerSet.delete(t)
            return this.getRandomGamePlayer()
        }
    }


    /**方向键按钮对象,控制角色移动*/
    @property({ type: Node })
    moveDirectionNode: Node = null

    /**方向键按钮对象,控制角色攻击*/
    @property({ type: Node })
    attackDirectionNode: Node = null

    /**对准玩家控制的角色的相机 */
    @property({ type: Camera })
    camera: Camera = null

    /**放置子弹的层级(父节点) */
    @property({type:Node})
    bulletLayer:Node=null

    /**放置阴影的节点 */
    @property({type:Node})
    shadowLayer:Node=null

    /**显示文本伤害的层(节点) */
    @property({type:Node})
    injuryLayer:Node=null


}



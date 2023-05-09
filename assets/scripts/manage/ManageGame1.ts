import { _decorator, Camera, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**在此处对节点进行统一管理 */
@ccclass('ManageGame1')
export class ManageGame1 extends Component {

    /**玩家角色列表 */
    gamePlayerSet=new Set<Node>()

    /**方向键按钮对象,控制角色移动*/
    @property({ type: Node })
    moveDirectionNode: Node = null

    /**方向键按钮对象,控制角色攻击*/
    @property({ type: Node })
    attackDirectionNode: Node = null

    /**对准玩家控制的角色的相机 */
    @property({ type: Camera })
    camera: Camera = null

    /**子弹预制体 */
    @property({type:Prefab})
    zidan1:Prefab=null

    /**放置子弹的层级(父节点) */
    @property({type:Node})
    bulletLayer:Node=null

    /**血条预制体 */
    @property({type:Prefab})
    bloodPrefab:Prefab=null

    /**阴影预制体 */
    @property({type:Prefab})
    shadowPrefab:Prefab=null

    /**放置阴影的节点 */
    @property({type:Node})
    shadowLayer:Node=null

    /**伤害文本预制体 */
    @property({type:Prefab})
    injuryPrefab:Prefab=null

    /**显示文本伤害的层(节点) */
    @property({type:Node})
    injuryLayer:Node=null

}



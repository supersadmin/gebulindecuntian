import { _decorator, Camera, Component, Node, Prefab } from 'cc';
import { Attack } from '../attack/Attack';
import { Villain } from '../Role/Villain';
const { ccclass, property } = _decorator;

/**在此处对节点进行统一管理 */
@ccclass('ManageGame1')
export class ManageGame1 extends Component {

    /**玩家角色列表 */
    gamePlayerSet = new Set<Node>()

    /**随机获取一名玩家 */
    getRandomGamePlayer(): Node {
        const i = Math.floor(this.gamePlayerSet.size * Math.random())
        const t = Array.from(this.gamePlayerSet)[i] || null
        if (t === null || t.isValid) {
            return t
        } else {
            this.gamePlayerSet.delete(t)
            return null
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
    @property({ type: Node })
    bulletLayer: Node = null

    /**放置阴影的节点 */
    @property({ type: Node })
    shadowLayer: Node = null

    /**显示文本伤害的层(节点) */
    @property({ type: Node })
    injuryLayer: Node = null

    /**显示技能释放指示器的节点 */
    @property({type:Node})
    skillIndicatorLayer:Node=null

    /**技能节点 */
    @property({ type: Node })
    skill1Node: Node = null
    @property({ type: Node })
    skill2Node: Node = null
    @property({ type: Node })
    skill3Node: Node = null
    @property({ type: Node })
    skill4Node: Node = null

    /**监听friction变化的函数列表 */
    onFrictionFn=new Set<(n:number)=>void>()
    /**打怪获得的分数 */
    _friction=0
    /**打怪获得的分数 */
    get friction(){
        return this._friction
    }
    set friction(val:number){
        this._friction=val
        this.onFrictionFn.forEach(item=>item(this.friction))
    }

    /**监听kill变化的函数列表 */
    onKillFn=new Set<(n:number)=>void>()
    /**怪物击杀量 */
    _kill=0
    /**怪物击杀量 */
    get kill(){
        return this._kill
    }
    set kill(val:number){
        this._kill=val
        this.onKillFn.forEach(item=>item(this.kill))
    }

    protected start(): void {
        Attack.onCauseDamageFn.add((d)=>{
            this.friction+=d
            return d
        })
        Villain.onVillainUnmountFn.add(()=>this.kill+=1)
    }

}



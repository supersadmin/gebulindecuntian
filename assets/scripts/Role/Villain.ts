import { _decorator, Collider2D, Component, Contact2DType, Node,PhysicsSystem2D,find } from 'cc';
import { Role } from './Role';
import { GamePlayer } from './GamePlayer';
import { ManageGame1 } from '../manage/ManageGame1';
import { physicsGroup } from '../other/getDirection';

const { ccclass, property } = _decorator;

/**怪物类基类 */
@ccclass('Villain')
export class Villain extends Role {

    /**统一管理节点与预制体等资源的组件 */
    manageNode: ManageGame1 = null
    
    /**攻击的角色 */
    target:Node=null

    /**自身的碰撞机 */
    collider:Collider2D=null

    /**被攻击的角色 */
    colliderMap=new Map<Collider2D,Function>()

    start() {

        this.hp=1000

        this.manageNode=find('manageNode').getComponent(ManageGame1)

        Role.prototype.start.call(this)
        this.getTarget()

        this.collider=this.getComponent(Collider2D)
        this.listenCollider()
    }

    update(dt: number) {
        if(this.target&&this.target.isValid){
            this.move(dt,this.target)
        }else{
            this.getTarget()
        }
    }

    /**开始监听碰撞 */
    listenCollider(){
        this.collider.on(Contact2DType.BEGIN_CONTACT,(coll1:Collider2D,coll2:Collider2D)=>{
            if(coll2.group===physicsGroup.juese){
                const target=coll2.getComponent(GamePlayer)
                if(target){
                    target.strike(this.damage)
                    this.colliderMap.set(coll2,()=>target.strike(this.damage))
                    this.schedule(this.colliderMap.get(coll2),0.5)
                }
            }
        })

        this.collider.on(Contact2DType.END_CONTACT,(coll1:Collider2D,coll2:Collider2D)=>{
            this.unschedule(this.colliderMap.get(coll2))
        })
    }

    /**获取攻击角色 */
    getTarget(){
        for(const t of this.manageNode.gamePlayerSet){
            this.target=t
            break
        }
    }

}



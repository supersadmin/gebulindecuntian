import { _decorator, Node, Vec3, Camera,resources, Prefab,instantiate,Sprite, find, SpriteFrame, director } from 'cc';
import { Role } from './Role';
import { Direction } from '../other/Direction';
import { computedDirection, mapSize,directionIndex,physicsGroup, myFind } from '../other/getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
import { Attack } from '../attack/Attack';
import { Strengthen } from '../skill/Strengthen';
import { SkillIndicator } from '../skill/SkillIndicator';
import { Teleport } from '../skill/Teleport';
import { Skill } from '../skill/Skill';
import { ImpactBomb } from '../attack/ImpactBomb';
import { ImpactBombSkill } from '../skill/ImpactBombSkill';

const { ccclass, property } = _decorator;


/**受玩家控制的角色应该继承此类 */
@ccclass('GamePlayer')
export class GamePlayer extends Role {

    /**统一管理节点以预制体等资源的组件 */
    manageNode: ManageGame1 = null

    /**角色攻击朝向 */
    attackDirection: string = null

    /**清除攻击朝向的函数
     * 比如角色往左走但是又在攻击右边的角色时
     * 此时的角色应该面朝右边
     */
    clearDirection: Function = null

    /**方向键按钮对象,控制角色移动*/
    moveDirectionNode: Node = null

    /**方向键按钮对象,控制角色攻击*/
    attackDirectionNode: Node = null

    /**方向键的脚本组件 */
    moveScript: Direction = null

    /**攻击键的脚本组件*/
    attackScript: Direction = null

    /**对准玩家控制的角色的相机 */
    camera: Camera = null

    /**攻击冷却时间 */
    attackInterval = 100

    /**攻击子弹预制体 */
    zidan1:Prefab=null

    /**放置子弹的层级 */
    bulletLayer:Node=null

    /**技能列表 */
    skillList=[Strengthen,Teleport,ImpactBombSkill]

    afterStart() {
        this.damage=31
        this.speed=340
        this.hp=200
        this.maxHp=200

        this.zidan1=Attack.getAttackPrefab()

        this.manageNode=myFind('manageNode')?.getComponent(ManageGame1)
        this.bulletLayer=this.manageNode.bulletLayer
        this.camera = this.manageNode.camera
        this.moveDirectionNode = this.manageNode.moveDirectionNode
        this.attackDirectionNode = this.manageNode.attackDirectionNode

        this.clearDirection = this.antiShake(() => this.attackDirection = null, 0.4)
        this.moveScript = this.moveDirectionNode.getComponent(Direction)
        this.attackScript=this.attackDirectionNode.getComponent(Direction)
        
        this.startAttack()
        this.setCamera()
        this.manageNode.gamePlayerSet.add(this.node)

        this.camera.orthoHeight=800

        /**后续节点可能尚未生成,放到下一帧执行 */
        this.scheduleOnce(()=>{
            this.pairSkill(this.manageNode.skill1Node,this.skillList[0])
            this.pairSkill(this.manageNode.skill2Node,this.skillList[1])
            this.pairSkill(this.manageNode.skill3Node,this.skillList[2])
        },0)
    }

    /**为技能指示器节点添加技能对象 */
    pairSkill(skillNode:Node,skill:typeof Skill){
        skillNode.getComponent(Sprite).spriteFrame=resources.get(skill.spriteFramePath)
        const skillIndicator=skillNode.getComponent(SkillIndicator)
        skillIndicator.skill=skill        
        skillIndicator.role=this
    }

    update(deltaTime: number) {

        if (this.moveScript.level !== 0) {
            this.move(deltaTime)
            this.animation.getState('move').isPlaying || this.animation.play()
            this.animation.getState('move').speed=this.moveScript.level
        } else {
            if (this.animation.getState('move').isPlaying) {
                this.animation.stop()
                this.frameEvent(this._n)
            }
        }
    }

    /** 为函数添加防抖
     * @param time 单位为秒
    */
    antiShake(fn: Function, time: number) {
        let f:Function
        return () => {
            this.unschedule(f)
            this.scheduleOnce(f=()=>fn(), time)
        }
    }

    /**为函数添加节流 */
    throttle(fn:Function,time:number){
        let t=false
        return (...argu)=>{
            if(t===false){
                fn(...argu)
                t=true
                this.scheduleOnce(()=>t=false,time)
            }
        }
    }

    /**控制角色移动 */
    move(dt: number) {

        const [n, m] = [this.moveDirectionNode.position.x, this.moveDirectionNode.position.y]
        const len = dt * this.speed * this.moveScript.level
        const len2 = Math.sqrt(n ** 2 + m ** 2)

        let offsetX = len * n / len2
        let offsetY = len * m / len2

        this.moveDirection = computedDirection(offsetX, offsetY)
        const p = this.node.position

        let [x, y] = [p.x + offsetX, p.y + offsetY]

        this.node.setPosition(new Vec3(x, y, 0))
        this.setCamera()
    }

    /**调用相机跟随 */
    setCamera() {
        const p = this.node.position
        this.camera.node.setPosition(new Vec3(p.x, p.y - 60, 1000))
    }

    /**开始攻击 */
    startAttack() {
        this.schedule((dt: number) => {
            /**dt为距离上一次执行所间隔的时间,单位为秒 */
            this.attackInterval -= (dt * 1000)
            if (this.attackInterval > 0|| !this.attackScript.touch ) {
                return
            }
            const attackDirection=new Vec3(this.attackDirectionNode.position.x,this.attackDirectionNode.position.y)
            this.attack(attackDirection,this.zidan1)
        }, 0.04)
    }

    /**进行攻击执行的逻辑
     * @param attackDirection 攻击的方向
     * @param attackPrefab 攻击子弹的预制体
     */
    attack(attackDirection:Vec3,attackPrefab:Prefab) {
        const d = instantiate(attackPrefab)
        const zd = d.getComponent(Attack)
        const dir = attackDirection
        /**为子弹添加随机偏移 */
        dir.x = dir.x * rnBox(this.moveScript.level)
        dir.y = dir.y * rnBox(this.moveScript.level)

        this.bulletLayer.addChild(d)
        zd.init(dir,this.node.worldPosition,physicsGroup.juesezidan,this.damage)

        this.attackDirection = computedDirection(dir.x, dir.y)
        this.frameEvent(this._n)
        this.clearDirection()
        this.attackInterval = zd.attackInterval * (this.moveScript.level || 1)
    }

    _n=0
    frameEvent(n: number) {
        this._n=n
        const d = this.attackDirection || this.moveDirection
        if (d === null) { return }
        this.node.getComponent(Sprite).spriteFrame = this.spriteAtlas.spriteFrames[this.beforeName + '_' + directionIndex[d][n]]
    }

    unmount(): void {
        Role.prototype.unmount.call(this)
        director.loadScene('game-load')
    }

}


function rnBox(n) {
    if (n === 0) {
        return 1
    } else if (n <= 1) {
        return randomNumber(0.1)
    } else if (n <= 2) {
        return randomNumber(0.2)
    }
    return 1
}

/**生成随机数 */
function randomNumber(n: number) {
    const t = (Math.random() - 0.5) * n * 2
    return 1 - t
}

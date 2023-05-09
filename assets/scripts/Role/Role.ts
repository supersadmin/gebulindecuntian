import { Component, _decorator, Sprite, Node,SpriteAtlas, Vec3, Animation } from "cc"
import { directionIndex, computedDirection, getSpriteName } from "../other/getDirection"

/**
 * @param hp 当前血量
 * @param newHp 要变化到的血量
 */
type fn1=(hp?:number,newHp?:number)=>void

/**
 * @param hp 当前血量
 * @param oldHp 变化之前的血量
 */
type fn2=(hp?:number,oldHp?:number)=>void

const { property } = _decorator;

/**角色类基类
 * 不管是玩家控制的角色
 * 还是npc怪物
 * 都应该继承该类
 */
export class Role extends Component {

  private _speed: number=280
  /**移动速度 */
  get speed() {
    return this._speed
  }
  set speed(val: number) {
    this._speed = val
  }

  private _maxHp: number=100
  /**最大生命值 */
  get maxHp() {
    return this._maxHp
  }
  set maxHp(val: number) {
    this._maxHp = val
  }

  /**监听生命值变化之前事件的函数列表*/
  onHpChangeBeforeFn=new Set<fn1>()
  /**监听生命值变化之后事件的函数列表*/
  onHpChangeAfterFn=new Set<fn2>()

  private _hp: number=100
  /**当前生命值 */
  get hp() {
    return this._hp
  }
  set hp(val: number) {
    this.onHpChangeBeforeFn.forEach(item=>item(this.hp,val))
    const oldHp=this.hp
    this._hp = val
    this.onHpChangeAfterFn.forEach(item=>item(this.hp,oldHp))
  }

  private _pr: number=5
  /**物理防御 */
  get pr() {
    return this._pr
  }
  set pr(val: number) {
    this._pr = val
  }

  private _ai: number=5
  /**角色免伤 */
  get ai() {
    return this._ai
  }
  set ai(val: number) {
    this._ai = val
  }

  private _damage: number=5
  /**攻击力 */
  get damage() {
    return this._damage
  }
  set damage(val: number) {
    this._damage = val
  }

  /**角色行走方向朝向 */
  moveDirection: string = null

  /**图集名称前缀 */
  beforeName = ''

  /**自身的精灵帧 */
  sprite: Sprite = null

  /**自身的精灵图集列表 */
  spriteAtlas: SpriteAtlas = null

  /**自身动画组件 */
  animation: Animation = null

  /**设置自身的动画组件,sprite组件以及图集列表 */
  start() {

    this.spriteAtlas = this.node.getComponent(Sprite).spriteAtlas
    this.animation = this.node.getComponent(Animation)
    this.sprite = this.node.getComponent(Sprite)
    this.beforeName = getSpriteName(this.sprite.spriteFrame.name)

  }

  /**受到伤害之前执行的函数列表 */
  onBeforeStrikeFn=new Set<(n:number)=>number>()
  /**受到伤害之后执行的函数列表 */
  onAfterStrikeFn=new Set<(n:number)=>void>()
  /**调用该函数进行扣血
    * 函数的返回值为最终扣除的血量
    */
  strike(damage: number) {
    this.onBeforeStrikeFn.forEach(item=>damage=item(damage))
    if (damage <= this.pr) {
      damage = damage * 0.3
    } else {
      damage = this.pr * 0.3 + damage - this.pr
    }

    damage = (1 - this.ai * 0.01) * damage
    damage=Math.floor(damage*10)/10
    this.hp = this.hp - damage
    if (this.hp <= 0) {
      this.death()
    }
    this.onAfterStrikeFn.forEach(item=>item(damage))
    return damage
  }

  /**角色死亡函数 */
  death() {
    this.unmount()
  }

  /**监听角色节点销毁函数的集合 */
  onUnmountBeforeFn=new Set<Function>()
  /**销毁所属节点 */
  unmount() {
    this.onUnmountBeforeFn.forEach(item=>item())
    this.node.destroy()
  }

  /**角色移动 */
  move(dt: number,target:Node) {
    if (target === null) {
      return
    }
    const sp = this.node.position
    const tp = target.position
    const x = sp.x - tp.x
    const y = sp.y - tp.y
    const k = Math.sqrt(x * x + y * y)
    if (k < 10) {
      return
    }
    const len = this.speed * dt
    const x1 = x * len / k
    const y1 = y * len / k
    this.node.setPosition(sp.subtract(new Vec3(x1, y1)))
    this.moveDirection = computedDirection(-1 * x1, -1 * y1)
  }

  /**事件帧执行函数 */
  frameEvent(n: number) {
    const d = this.moveDirection
    if (d === null) { return }
    this.sprite.spriteFrame = this.spriteAtlas.spriteFrames[this.beforeName + '_' + directionIndex[d][n]]
  }

}
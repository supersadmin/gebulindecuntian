import { Role } from "../Role/Role";
import { physicsGroup } from "../other/getDirection";
import { Attack } from "./Attack";
import { _decorator, Component, Node, Vec3, director, Collider2D, AudioSource, AudioClip, UITransform, Contact2DType, BoxCollider2D, PhysicsSystem2D, resources, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ImpactBomb')
export class ImpactBomb extends Attack {
  static getAttackPrefab: (() => Prefab) = () => resources.get('prefab/ImpactBomb', Prefab)
  _attackInterval = 800
  _damage: number = 16
  _speed: number = 300
  _lifeTime: number = 6
  attackAudioClip=null
  createAudioClip=null

  /**接触列表 */
  colliderList=new Set<Role>()

  /**开始监听碰撞 */
  listenCollider() {
    this.collider.on(Contact2DType.BEGIN_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
      if (physicsGroup.guaiwu === coll2.group) {
        const target = coll2.getComponent(Role)
        if (target) {
          this.colliderList.add(target)
        }
      }
    })

    this.collider.on(Contact2DType.END_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
      if (physicsGroup.guaiwu === coll2.group) {
        const target = coll2.getComponent(Role)
        if (target) {
          this.colliderList.delete(target)
        }
      }
    })

    this.schedule(()=>{
      this.colliderList.forEach(item=>item.strike(this.damage))
    },0.1)

  }


}
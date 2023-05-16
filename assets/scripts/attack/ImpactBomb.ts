import { Role } from "../Role/Role";
import { physicsGroup } from "../other/getDirection";
import { Attack } from "./Attack";
import { _decorator, Collider2D,  Contact2DType, resources, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ImpactBomb')
export class ImpactBomb extends Attack {
  static getAttackPrefab: (() => Prefab) = () => resources.get('prefab/ImpactBomb', Prefab)
  _attackInterval = 200
  _damage: number = 16
  _speed: number = 150
  _lifeTime: number = 8
  attackAudioClip=null
  createAudioClip=null

  /**接触列表 */
  colliderList=new Set<Role>()

  /**开始监听碰撞 */
  listenCollider() {
    this.collider.on(Contact2DType.BEGIN_CONTACT, (_: Collider2D, coll2: Collider2D) => {
      if (physicsGroup.guaiwu === coll2.group) {
        const target = coll2.getComponent(Role)
        if (target) {
          this.colliderList.add(target)
        }
      }
    })

    this.collider.on(Contact2DType.END_CONTACT, (_: Collider2D, coll2: Collider2D) => {
      if (physicsGroup.guaiwu === coll2.group) {
        const target = coll2.getComponent(Role)
        if (target) {
          this.colliderList.delete(target)
        }
      }
    })

    this.schedule(()=>{
      this.colliderList.forEach(item=>item.isValid&&this.causeDamage(item))
    },0.1)

  }

}
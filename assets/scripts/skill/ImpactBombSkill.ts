import { _decorator, Component, math, Node, resources, SpriteFrame, Vec3 } from 'cc';
import { Skill } from './Skill';
import { Role } from '../Role/Role';
import { ImpactBomb } from '../attack/ImpactBomb';
const { ccclass, property } = _decorator;

/**角色范围伤害技能 */
@ccclass('ImpactBombSkill')
export class ImpactBombSkill extends Skill{

  /**角色技能指示器范围半径 */
  static radius=300
  static sliderType:0|1|2=1
  static cd=6
  static spriteFramePath='icon/icon/Icon26'
  static queryFn(role:Role,relative:Vec3){
    role.attack(relative,ImpactBomb.getAttackPrefab())
  }

  start(){
    /**释放技能就会添加组件,该技能不需要添加,直接销毁组件 */
    this.destroy()
  }

}
import { _decorator, Component, math, Node, resources, SpriteFrame, Vec3 } from 'cc';
import { Skill } from './Skill';
import { Role } from '../Role/Role';
const { ccclass, property } = _decorator;

/**角色位移技能 */
@ccclass('Teleport')
export class Teleport extends Skill{

  /**角色技能指示器范围半径 */
  static radius=480
  static sliderType:0|1|2=2
  static cd=6
  static spriteFramePath='icon/icon/Icon11'
  static queryFn(role:Role,relative:Vec3){
    role.addComponent(Teleport)
    const tpleport=role.getComponent(Teleport)
    tpleport.move(relative,role)
  }


  start(){
    
  }

  move(relative:Vec3,role:Role){

    relative.multiplyScalar(4)
    let p=role.node.getPosition()
    p.add(relative)
    role.node.setPosition(p)

    this.destroy()
    /**触发相机跟随 */
    role.setCamera()
  }

}
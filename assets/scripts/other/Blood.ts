import { _decorator, Component, Node, Prefab, resources, instantiate, BoxCollider2D, CircleCollider2D, Vec3, Sprite, SpriteFrame, UITransform } from 'cc';
import { ManageGame1 } from '../manage/ManageGame1';
import { Role } from '../Role/Role';
import { myFind } from './getDirection';
const { ccclass, property, float } = _decorator;

/**血条 */
@ccclass('Blood')
export class Blood extends Component {

    /**统一管理节点与预制体等资源的组件 */
    manageNode: ManageGame1 = null

    /**血条放大倍数 */
    @float
    scale: number = 1

    /**血条子节点,显示血量的 */
    bloodChild: Node = null

    /**血条预制体 */
    bloodPrefab: Prefab = null

    /**外层精灵图帧 */
    @property({ type: SpriteFrame })
    boxSpriteFrame: SpriteFrame = null

    /**内层精灵图帧 */
    @property({ type: SpriteFrame })
    contextSpriteFrame: SpriteFrame = null

    start() {
        this.manageNode = myFind('manageNode')?.getComponent(ManageGame1)

        this.bloodPrefab = resources.get('prefab/bloodBox', Prefab)
        const node = instantiate(this.bloodPrefab)
        this.init(node)

        const role = this.getComponent(Role)
        this.listenStrike(role)

    }

    init(node: Node) {

        this.scale = this.getComponent(UITransform).width / node.getComponent(UITransform).width

        this.bloodChild = node.getChildByName('bloodContext')
        node.scale = new Vec3(this.scale, this.scale)
        const offsetY = this.computedOffsetY(this.node)
        node.setPosition(new Vec3(0, offsetY))
        this.node.addChild(node)
        if (this.boxSpriteFrame) {
            node.getComponent(Sprite).spriteFrame = this.boxSpriteFrame
        }
        if (this.contextSpriteFrame) {
            node.getComponentInChildren(Sprite).spriteFrame = this.contextSpriteFrame
        }
    }

    /**计算偏移量 */
    computedOffsetY(node: Node) {
        const coll1 = node.getComponent(BoxCollider2D)
        if (coll1?.size) {
            return coll1.size.height / 2
        }
        const coll2 = node.getComponent(CircleCollider2D)
        return coll2 ? coll2.radius : 0
    }

    /**监听血量变化事件 */
    listenStrike(role: Role) {
        if (!role) { return }
        role.onHpChangeAfterFn.add(() => {
            const maxHp = role.maxHp
            const hp = role.hp
            let scale = hp / maxHp
            scale = scale > 1 ? 1 : scale
            scale = scale < 0 ? 0 : scale
            this.bloodChild.scale = new Vec3(scale, 1)
        })
    }

}



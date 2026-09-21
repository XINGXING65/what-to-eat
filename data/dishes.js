/**
 *  菜品数据文件
 *  【字段说明】
 *    name         必填，菜名（字符串）
 *    ingredients  必填，原材料（字符串数组）
 *    tags         可选，标签，如 荤菜 / 素菜 / 汤 / 主食 / 快手（字符串数组）
 *    note         可选，备注，如 "20 分钟" 或一句做法提示（字符串）
 */

window.DISHES = [
	{
		name: '番茄炒蛋',
		ingredients: ['番茄', '鸡蛋', '小葱'],
		tags: ['家常', '下饭'],
		note: '10 分钟'
	},
	{
		name: '青椒肉丝',
		ingredients: ['青椒', '猪里脊', '蒜'],
		tags: ['家常', '下饭'],
		note: '15 分钟'
	},
	{
		name: '紫菜蛋花汤',
		ingredients: ['紫菜', '鸡蛋', '虾皮'],
		tags: ['汤'],
		note: '超级鲜'
	},
	{
		name: '蒜蓉西兰花',
		ingredients: ['西兰花', '大蒜']
	}
]

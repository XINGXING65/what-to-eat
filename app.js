'use strict'
;(function () {
	// 与 styles.css 中 cardIn 动画时长保持一致
	var ANIM_MS = 340

	var resultGrid = document.getElementById('resultGrid')
	var drawBtn = document.getElementById('drawBtn')
	var hint = document.getElementById('hint')

	var pool = [] // 菜品池
	var currentPair = [] // 当前展示的两道菜
	var hasDrawn = false // 是否已经抽过，决定按钮文案
	var busy = false // 防连点

	/* ------------------------------------------------------------
     读取并归一化 window.DISHES
     用户手写数据难免有笔误，这里做最宽松的容错：
     坏数据直接丢弃、缺字段补默认值，保证页面不白屏。
     ------------------------------------------------------------ */
	function loadDishes() {
		var raw = window.DISHES

		if (!Array.isArray(raw)) {
			console.warn('暂无数据，请检查数据是否完整！')
			return []
		}

		var seen = {}
		var list = []

		raw.forEach(function (item) {
			if (!item || typeof item !== 'object') return

			var name = typeof item.name === 'string' ? item.name.trim() : ''
			if (!name) return // 菜名必填
			if (seen[name]) return // 同名菜品去重，只保留第一条
			seen[name] = true

			list.push({
				name: name,
				ingredients: toCleanArray(item.ingredients),
				tags: toCleanArray(item.tags),
				note: typeof item.note === 'string' ? item.note.trim() : ''
			})
		})

		return list
	}

	/* 只保留非空字符串，并去掉首尾空格 */
	function toCleanArray(value) {
		if (!Array.isArray(value)) return []

		var result = []
		value.forEach(function (entry) {
			if (typeof entry !== 'string') return

			var text = entry.trim()
			if (text !== '') result.push(text)
		})
		return result
	}

	/* 随机抽取 */
	function drawOnce(list) {
		var first = Math.floor(Math.random() * list.length)
		var second = Math.floor(Math.random() * (list.length - 1))
		if (second >= first) second += 1 // 保证第二个下标与第一个不同
		return [list[first], list[second]]
	}

	function getName(dish) {
		return dish.name
	}

	function samePair(a, b) {
		var an = a.map(getName).sort()
		var bn = b.map(getName).sort()
		return an[0] === bn[0] && an[1] === bn[1]
	}

	function pickTwo(list, exclude) {
		var pair = drawOnce(list)

		// 池子够大时避免和上一轮完全一样（顺序无关），最多重试一次
		if (list.length > 2 && exclude.length === 2 && samePair(pair, exclude)) {
			pair = drawOnce(list)
		}

		return pair
	}

	/* 渲染 */
	function el(tag, className, text) {
		var node = document.createElement(tag)
		if (className) node.className = className
		if (text !== undefined) node.textContent = text
		return node
	}

	/* 首屏占位：两张虚线卡，引导用户去点按钮 */
	function renderPlaceholder() {
		var frag = document.createDocumentFragment()
		var texts = ['今天吃点什么好', '点下面的按钮试试']

		for (var i = 0; i < 2; i += 1) {
			var card = el('div', 'dish-card dish-card--placeholder')
			card.appendChild(el('span', 'placeholder-mark', '?'))
			card.appendChild(el('p', 'placeholder-text', texts[i]))
			frag.appendChild(card)
		}

		resultGrid.replaceChildren(frag)
	}

	/* 渲染抽到的两道菜；全部用 textContent 写入，避免用户录入的特殊字符破坏结构 */
	function renderPair(pair) {
		var frag = document.createDocumentFragment()

		pair.forEach(function (dish, index) {
			var card = el('article', 'dish-card dish-card--anim')
			if (index > 0) card.style.animationDelay = '120ms'

			card.appendChild(el('h2', 'dish-name', dish.name))

			var field = el('div', 'field')
			field.appendChild(el('span', 'field-label', '原材料'))

			var list = el('ul', 'ingredient-list')
			if (dish.ingredients.length > 0) {
				dish.ingredients.forEach(function (name) {
					list.appendChild(el('li', 'ingredient', name))
				})
			} else {
				list.appendChild(el('li', 'ingredient ingredient--empty', '原材料待补充'))
			}
			field.appendChild(list)
			card.appendChild(field)

			if (dish.tags.length > 0) {
				var tagWrap = el('div', 'tag-list')
				dish.tags.forEach(function (tag) {
					tagWrap.appendChild(el('span', 'dish-tag', tag))
				})
				card.appendChild(tagWrap)
			}

			if (dish.note) {
				card.appendChild(el('p', 'dish-note', dish.note))
			}

			frag.appendChild(card)
		})

		resultGrid.replaceChildren(frag)
	}

	/* 状态与提示 */
	function showHint(message) {
		hint.textContent = message
		hint.hidden = false
	}

	function hideHint() {
		hint.hidden = true
		hint.textContent = ''
	}

	function updateButton() {
		if (pool.length < 2) {
			drawBtn.disabled = true
			drawBtn.textContent = '菜品不够'
			return
		}

		drawBtn.disabled = false
		drawBtn.textContent = hasDrawn ? '换一批' : '开始抽'
	}

	/* 数据不足时的空状态 */
	function applyEmptyState() {
		if (pool.length === 0) {
			showHint('还没有菜品。打开 data/dishes.js，按里面的示例格式加几道菜吧。')
			return
		}

		if (pool.length === 1) {
			showHint('至少要有 2 道菜才能抽，再去加一道吧。')
			return
		}

		hideHint()
	}

	/* 交互 */
	function handleDraw() {
		if (busy || pool.length < 2) return

		busy = true
		window.setTimeout(function () {
			busy = false
		}, ANIM_MS)

		currentPair = pickTwo(pool, currentPair)
		renderPair(currentPair)

		hasDrawn = true
		updateButton()
	}

	function init() {
		pool = loadDishes()
		applyEmptyState()
		renderPlaceholder()
		updateButton()

		drawBtn.addEventListener('click', handleDraw)
	}

	init()
})()

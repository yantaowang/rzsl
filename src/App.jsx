import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  // 游戏状态管理
  const [currentGame, setCurrentGame] = useState('menu') // menu, numberMemory, colorMatch, reactionTest
  const [score, setScore] = useState({ numberMemory: 0, colorMatch: 0, reactionTest: 0 })
  const [highScore, setHighScore] = useState({ numberMemory: 0, colorMatch: 0, reactionTest: 0 })
  
  // 数字记忆游戏状态
  const [numberSequence, setNumberSequence] = useState('')
  const [userInput, setUserInput] = useState('')
  const [showSequence, setShowSequence] = useState(false)
  const [difficulty, setDifficulty] = useState(3) // 初始序列长度
  const [round, setRound] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [isInputActive, setIsInputActive] = useState(false)
  
  // 颜色匹配游戏状态
  const [targetColor, setTargetColor] = useState('')
  const [colorOptions, setColorOptions] = useState([])
  const [colorMatches, setColorMatches] = useState(0)
  const [colorAttempts, setColorAttempts] = useState(0)
  const [colorTimer, setColorTimer] = useState(30)
  const colorTimerRef = useRef(null)
  
  // 反应速度测试状态
  const [reactionTestState, setReactionTestState] = useState('ready') // ready, waiting, testing, result
  const [reactionTime, setReactionTime] = useState(0)
  const [reactionTestCount, setReactionTestCount] = useState(0)
  const [averageReactionTime, setAverageReactionTime] = useState(0)
  const reactionStartTimeRef = useRef(null)
  const reactionTestTimerRef = useRef(null)
  
  // 加载本地存储的高分
  useEffect(() => {
    const savedHighScore = localStorage.getItem('brainTrainingHighScore')
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore))
    }
  }, [])
  
  // 更新高分并保存到本地存储
  useEffect(() => {
    const newHighScore = { ...highScore }
    let updated = false
    
    Object.keys(score).forEach(game => {
      if (score[game] > highScore[game]) {
        newHighScore[game] = score[game]
        updated = true
      }
    })
    
    if (updated) {
      setHighScore(newHighScore)
      localStorage.setItem('brainTrainingHighScore', JSON.stringify(newHighScore))
    }
  }, [score, highScore])
  
  // 生成随机数字序列
  const generateNumberSequence = (length) => {
    let sequence = ''
    for (let i = 0; i < length; i++) {
      sequence += Math.floor(Math.random() * 10)
    }
    return sequence
  }
  
  // 开始数字记忆游戏
  const startNumberMemoryGame = () => {
    setCurrentGame('numberMemory')
    setDifficulty(3)
    setRound(1)
    setScore(prev => ({ ...prev, numberMemory: 0 }))
    startNumberMemoryRound()
  }
  
  // 开始数字记忆游戏的新回合
  const startNumberMemoryRound = () => {
    setUserInput('')
    setFeedback('')
    setIsInputActive(false)
    
    // 生成新的数字序列
    const sequence = generateNumberSequence(difficulty)
    setNumberSequence(sequence)
    setShowSequence(true)
    
    // 2秒后隐藏序列
    setTimeout(() => {
      setShowSequence(false)
      setIsInputActive(true)
    }, 2000)
  }
  
  // 检查用户输入的数字序列
  const checkNumberInput = () => {
    if (userInput === numberSequence) {
      setFeedback('正确！继续下一关')
      setScore(prev => ({ ...prev, numberMemory: prev.numberMemory + 10 * difficulty }))
      setRound(prev => prev + 1)
      setDifficulty(prev => prev + 1)
      setTimeout(startNumberMemoryRound, 1500)
    } else {
      setFeedback(`错误！正确的序列是: ${numberSequence}`)
      setIsInputActive(false)
    }
  }
  
  // 生成随机颜色
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }
  
  // 生成颜色名称
  const getColorName = (hexColor) => {
    const colors = {
      '#FF0000': '红色',
      '#00FF00': '绿色',
      '#0000FF': '蓝色',
      '#FFFF00': '黄色',
      '#FF00FF': '紫色',
      '#00FFFF': '青色',
      '#FFA500': '橙色',
      '#A52A2A': '棕色',
      '#800080': '紫色',
      '#008000': '绿色',
      '#000080': '深蓝色',
      '#808000': '橄榄色',
      '#800000': '栗色',
      '#008080': '青色',
    }
    return colors[hexColor] || '未知颜色'
  }
  
  // 开始颜色匹配游戏
  const startColorMatchGame = () => {
    setCurrentGame('colorMatch')
    setColorMatches(0)
    setColorAttempts(0)
    setColorTimer(30)
    setScore(prev => ({ ...prev, colorMatch: 0 }))
    generateNewColorMatch()
    
    // 启动计时器
    if (colorTimerRef.current) clearInterval(colorTimerRef.current)
    colorTimerRef.current = setInterval(() => {
      setColorTimer(prev => {
        if (prev <= 1) {
          clearInterval(colorTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  
  // 生成新的颜色匹配题目
  const generateNewColorMatch = () => {
    const colors = []
    for (let i = 0; i < 4; i++) {
      colors.push(generateRandomColor())
    }
    const targetIndex = Math.floor(Math.random() * 4)
    setTargetColor(colors[targetIndex])
    setColorOptions(colors)
  }
  
  // 检查颜色匹配
  const checkColorMatch = (selectedColor) => {
    setColorAttempts(prev => prev + 1)
    if (selectedColor === targetColor) {
      setColorMatches(prev => prev + 1)
      setScore(prev => ({ ...prev, colorMatch: prev.colorMatch + 10 }))
      generateNewColorMatch()
    }
    
    // 如果计时器结束，停止游戏
    if (colorTimer <= 0) {
      clearInterval(colorTimerRef.current)
    }
  }
  
  // 开始反应速度测试
  const startReactionTest = () => {
    setCurrentGame('reactionTest')
    setReactionTestState('ready')
    setReactionTestCount(0)
    setAverageReactionTime(0)
    setScore(prev => ({ ...prev, reactionTest: 0 }))
  }
  
  // 准备下一次反应测试
  const prepareReactionTest = () => {
    setReactionTestState('waiting')
    
    // 随机延迟1-3秒后显示测试区域
    const waitTime = Math.floor(Math.random() * 2000) + 1000
    
    if (reactionTestTimerRef.current) clearTimeout(reactionTestTimerRef.current)
    reactionTestTimerRef.current = setTimeout(() => {
      setReactionTestState('testing')
      reactionStartTimeRef.current = Date.now()
    }, waitTime)
  }
  
  // 记录反应时间
  const recordReactionTime = () => {
    if (reactionTestState !== 'testing') return
    
    const endTime = Date.now()
    const time = endTime - reactionStartTimeRef.current
    setReactionTime(time)
    setReactionTestState('result')
    
    // 更新计数和平均时间
    const newCount = reactionTestCount + 1
    setReactionTestCount(newCount)
    
    // 计算新的平均分
    const newAverage = ((averageReactionTime * reactionTestCount) + time) / newCount
    setAverageReactionTime(Math.round(newAverage))
    
    // 更新分数（时间越短分数越高，最高100分）
    const newScore = Math.max(0, 100 - time / 20)
    setScore(prev => ({ ...prev, reactionTest: Math.round(prev.reactionTest + newScore) }))
  }
  
  // 结束游戏并返回菜单
  const endGame = () => {
    // 清除所有计时器
    if (colorTimerRef.current) clearInterval(colorTimerRef.current)
    if (reactionTestTimerRef.current) clearTimeout(reactionTestTimerRef.current)
    setCurrentGame('menu')
  }
  
  // 渲染游戏菜单
  const renderMenu = () => (
    <div className="game-menu">
      <h1>大脑认知训练游戏</h1>
      <div className="menu-options">
        <button className="menu-button" onClick={startNumberMemoryGame}>数字记忆挑战</button>
        <button className="menu-button" onClick={startColorMatchGame}>颜色匹配游戏</button>
        <button className="menu-button" onClick={startReactionTest}>反应速度测试</button>
      </div>
      <div className="high-scores">
        <h3>最高分记录</h3>
        <p>数字记忆: {highScore.numberMemory}</p>
        <p>颜色匹配: {highScore.colorMatch}</p>
        <p>反应速度: {highScore.reactionTest}</p>
      </div>
    </div>
  )
  
  // 渲染数字记忆游戏
  const renderNumberMemoryGame = () => (
    <div className="game-container">
      <h2>数字记忆挑战</h2>
      <p className="score">当前分数: {score.numberMemory}</p>
      <p className="round">第 {round} 轮 (难度: {difficulty} 位数字)</p>
      
      <div className="sequence-display">
        {showSequence ? (
          <div className="numbers">{numberSequence.split('').map((num, index) => (
            <span key={index} className="number-digit">{num}</span>
          ))}</div>
        ) : (
          <div className="input-area">
            {isInputActive ? (
              <>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={difficulty}
                  placeholder={`输入 ${difficulty} 位数字...`}
                  className="number-input"
                  autoFocus
                />
                <button onClick={checkNumberInput} disabled={userInput.length !== difficulty}>
                  提交
                </button>
              </>
            ) : (
              <p>准备开始...</p>
            )}
          </div>
        )}
      </div>
      
      {feedback && <p className="feedback">{feedback}</p>}
      
      <button className="back-button" onClick={endGame}>返回菜单</button>
    </div>
  )
  
  // 渲染颜色匹配游戏
  const renderColorMatchGame = () => (
    <div className="game-container">
      <h2>颜色匹配游戏</h2>
      <p className="score">当前分数: {score.colorMatch}</p>
      <p className="timer">剩余时间: {colorTimer}秒</p>
      
      <div className="color-match-container">
        <div className="target-color">
          <p>找出: <span className="color-name">{getColorName(targetColor)}</span></p>
        </div>
        
        <div className="color-options">
          {colorOptions.map((color, index) => (
            <button
              key={index}
              className="color-button"
              style={{ backgroundColor: color }}
              onClick={() => checkColorMatch(color)}
            />
          ))}
        </div>
        
        <p className="color-stats">正确匹配: {colorMatches} / 总尝试: {colorAttempts}</p>
      </div>
      
      {colorTimer <= 0 && (
        <p className="game-over">游戏结束！你的最终得分是: {score.colorMatch}</p>
      )}
      
      <button className="back-button" onClick={endGame}>返回菜单</button>
    </div>
  )
  
  // 渲染反应速度测试
  const renderReactionTest = () => (
    <div className="game-container">
      <h2>反应速度测试</h2>
      <p className="score">当前分数: {score.reactionTest}</p>
      <p className="test-count">测试次数: {reactionTestCount} 次</p>
      {reactionTestCount > 0 && <p className="average-time">平均反应时间: {averageReactionTime}ms</p>}
      
      <div className="reaction-test-area">
        {reactionTestState === 'ready' && (
          <div className="ready-state">
            <p>点击下方开始测试</p>
            <button onClick={prepareReactionTest}>开始测试</button>
          </div>
        )}
        
        {reactionTestState === 'waiting' && (
          <div className="waiting-state">
            <p>等待中...</p>
            <div className="waiting-box"></div>
          </div>
        )}
        
        {reactionTestState === 'testing' && (
          <div className="testing-state" onClick={recordReactionTime}>
            <div className="test-box"></div>
          </div>
        )}
        
        {reactionTestState === 'result' && (
          <div className="result-state">
            <p>你的反应时间: {reactionTime}ms</p>
            <button onClick={prepareReactionTest}>再试一次</button>
            <button onClick={() => setReactionTestState('ready')}>返回准备</button>
          </div>
        )}
      </div>
      
      <button className="back-button" onClick={endGame}>返回菜单</button>
    </div>
  )
  
  return (
    <div className="app">
      {currentGame === 'menu' && renderMenu()}
      {currentGame === 'numberMemory' && renderNumberMemoryGame()}
      {currentGame === 'colorMatch' && renderColorMatchGame()}
      {currentGame === 'reactionTest' && renderReactionTest()}
    </div>
  )
}

export default App

import React, { useState, useEffect } from 'react'

interface TutorialStep {
  title: string
  content: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to BlockFlight! 🚀',
    content: 'BlockFlight is a market-driven prediction platform on BlockDAG. Learn how to get started.',
    target: '#welcome',
    position: 'bottom'
  },
  {
    title: 'Connect Your Wallet',
    content: 'Click here to connect your MetaMask wallet. Make sure you\'re on the BlockDAG network.',
    target: '#wallet-connect',
    position: 'bottom'
  },
  {
    title: 'Choose a Feature',
    content: 'Select from Market Aviator, AI Oracle, Community Market, or Cruise Mode to get started.',
    target: '#feature-selector',
    position: 'bottom'
  },
  {
    title: 'Ready to Trade!',
    content: 'You\'re all set! Start exploring the features and make your first prediction.',
    position: 'bottom'
  }
]

export function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('bf_tutorial_completed')
    if (!hasSeenTutorial) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsOpen(false)
    localStorage.setItem('bf_tutorial_completed', 'true')
  }

  if (!isOpen) {
    return null
  }

  const step = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(139,92,246,0.95) 100%)',
        borderRadius: 16,
        padding: 32,
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Progress Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#fff',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Content */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12,
            textAlign: 'center'
          }}>
            {currentStep === 0 ? '👋' : currentStep === 1 ? '🔗' : currentStep === 2 ? '🎯' : '🎉'}
          </div>
          <h2 style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: 'bold',
            margin: '0 0 12px 0',
            textAlign: 'center'
          }}>
            {step.title}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
            textAlign: 'center'
          }}>
            {step.content}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 24
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: index === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Skip Tutorial
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#fff',
              border: 'none',
              color: '#7c3aed',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

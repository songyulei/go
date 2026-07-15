import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Home from '@/pages/Home'

describe('Home', () => {
  it('renders hero content and core features', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText('多语种沉浸式学习平台')).toBeInTheDocument()
    expect(screen.getByText('立即注册体验')).toBeInTheDocument()
    expect(screen.getByText('分级课程体系')).toBeInTheDocument()
    expect(await screen.findByText('本周重点攻克“助词辨析 + 中速听力抓取”')).toBeInTheDocument()
  })
})

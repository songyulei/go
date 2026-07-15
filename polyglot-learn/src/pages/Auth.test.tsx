import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import Auth from '@/pages/Auth'

describe('Auth flow', () => {
  it('submits onboarding form and navigates to recommendation page', async () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/path" element={<div>个性化学习路径推荐</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /注册并进入个性化路径/i }))

    expect(await screen.findByText('个性化学习路径推荐')).toBeInTheDocument()
  })
})

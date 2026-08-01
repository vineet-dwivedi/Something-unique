import { forwardRef } from 'react'

function scrollToTarget(target, offset = 0, smooth = true) {
  if (typeof window === 'undefined') return

  const node =
    document.getElementById(target) || document.querySelector(`[name="${target}"]`)

  if (!node) return

  const top = window.scrollY + node.getBoundingClientRect().top - Number(offset || 0)

  window.scrollTo({
    top,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

export const Link = forwardRef(function Link(
  { to, offset = 0, smooth = true, onClick, href, children, ...rest },
  ref,
) {
  const handleClick = (event) => {
    onClick?.(event)

    if (event.defaultPrevented) return

    if (typeof to === 'string' && to) {
      event.preventDefault()
      scrollToTarget(to, offset, smooth)
    }
  }

  return (
    <a
      ref={ref}
      href={href ?? (typeof to === 'string' ? `#${to}` : '#')}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  )
})

export const animateScroll = {
  scrollToTop(options = {}) {
    if (typeof window === 'undefined') return

    window.scrollTo({
      top: 0,
      behavior: options.smooth === false ? 'auto' : 'smooth',
    })
  },
}

export const scroller = {
  scrollTo(target, options = {}) {
    scrollToTarget(target, options.offset, options.smooth !== false)
  },
}

export default {
  Link,
  animateScroll,
  scroller,
}

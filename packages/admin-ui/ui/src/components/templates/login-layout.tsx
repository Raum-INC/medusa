import { PropsWithChildren } from "react"
import { Toaster } from "react-hot-toast"

const PublicLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Toaster
        containerStyle={{
          top: 24,
          left: 24,
          bottom: 24,
          right: 24,
        }}
        position="bottom-right"
      />
      <div className="mb-large">
        <Logo />
      </div>
      {children}
    </div>
  )
}

const Logo = () => {
  return (
    <div className="w-5xlarge h-5xlarge flex items-center justify-center rounded-full">
      <SVG />
    </div>
  )
}

const SVG = () => {
  return (
    <img src={'/logo.svg'}/>
  )
}

export default PublicLayout

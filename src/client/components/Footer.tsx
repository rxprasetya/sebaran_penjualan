import React from "react"

interface FooterProps {
    name: string
}

const Footer: React.FC<FooterProps> = ({ name }) => {
    return (
        <footer>
            <div className="footer clearfix mb-0 text-muted">
                <div className="float-start">
                    <p>2025 &copy; Mazer</p>
                </div>
                <div className="float-end">
                    <p>
                        <a href="#">{name}</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
import { COLORS } from '../constants/colors';
import { txt } from '../utils/styles';

const C = COLORS;
const RADIUS = 18;
const TAIL_WIDTH = 13;
const TAIL_HEIGHT = 18;

// Đuôi "móc câu" cong ra từ góc dưới của bong bóng (vẽ cho phía phải, phía trái thì lật ngang)
const Tail = ({ color, isOwn }) => (
  <svg
    width={TAIL_WIDTH}
    height={TAIL_HEIGHT}
    viewBox={`0 0 ${TAIL_WIDTH} ${TAIL_HEIGHT}`}
    aria-hidden="true"
    style={{
      position: 'absolute', bottom: 0,
      [isOwn ? 'right' : 'left']: -TAIL_WIDTH + 1,
      transform: isOwn ? 'none' : 'scaleX(-1)'
    }}
  >
    <path d="M0 0 C0 9 4 15 13 18 H0 Z" fill={color} />
  </svg>
);

/*
 * Bong bóng tin nhắn dùng chung cho trang chat của ứng viên và nhà tuyển dụng.
 * isOwn: tin của mình (bên phải, màu tím) / tin của người kia (bên trái, màu xám).
 */
export default function MessageBubble({ message, isOwn }) {
  // Tin nhận dùng nền trắng để tách khỏi nền xám của khung chat
  const background = isOwn ? C.blueBubble : C.white;
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 12, padding: '0 8px' }}>
      <div style={{
        // Không vượt quá nửa chiều rộng khung chat
        position: 'relative', maxWidth: '50%', padding: '10px 14px 8px',
        borderRadius: RADIUS,
        // Góc nối với đuôi để vuông cho liền mạch
        [isOwn ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 0,
        background,
        boxShadow: isOwn ? '0 4px 12px rgba(109, 93, 252, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.08)'
      }}>
        <p style={{
          ...txt(14, 400, isOwn ? C.white : C.navy), lineHeight: 1.5,
          whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'
        }}>
          {message.text}
        </p>
        <span style={{
          ...txt(11, 400, isOwn ? 'rgba(255,255,255,0.75)' : C.gray),
          display: 'block', marginTop: 4, textAlign: isOwn ? 'right' : 'left'
        }}>
          {message.time}
        </span>
        <Tail color={background} isOwn={isOwn} />
      </div>
    </div>
  );
}

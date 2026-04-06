import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';

const FPS = 30;

// --- Clean SVG Icons ---

const RobotIcon: React.FC = () => (
	<svg viewBox="0 0 120 120" width={120} height={120} fill="none">
		<rect x="25" y="35" width="70" height="60" rx="14" fill="white" fillOpacity={0.2} stroke="white" strokeWidth="3" />
		<circle cx="45" cy="62" r="8" fill="white" />
		<circle cx="75" cy="62" r="8" fill="white" />
		<rect x="45" y="80" width="30" height="6" rx="3" fill="white" fillOpacity={0.7} />
		<line x1="60" y1="35" x2="60" y2="18" stroke="white" strokeWidth="3" strokeLinecap="round" />
		<circle cx="60" cy="14" r="5" fill="white" />
		<line x1="25" y1="60" x2="12" y2="60" stroke="white" strokeWidth="3" strokeLinecap="round" />
		<line x1="95" y1="60" x2="108" y2="60" stroke="white" strokeWidth="3" strokeLinecap="round" />
	</svg>
);

const BrainIcon: React.FC = () => (
	<svg viewBox="0 0 120 120" width={120} height={120} fill="none">
		<path
			d="M60 105 C60 105 25 90 25 55 C25 30 40 15 60 15 C80 15 95 30 95 55 C95 90 60 105 60 105Z"
			fill="white"
			fillOpacity={0.2}
			stroke="white"
			strokeWidth="3"
		/>
		<path d="M60 20 C60 20 60 105 60 105" stroke="white" strokeWidth="2" strokeOpacity={0.5} />
		<path d="M38 40 C48 45 52 40 60 42" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M82 40 C72 45 68 40 60 42" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M35 60 C45 55 55 62 60 58" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M85 60 C75 55 65 62 60 58" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M40 78 C48 72 55 78 60 75" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<path d="M80 78 C72 72 65 78 60 75" stroke="white" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const TargetIcon: React.FC = () => (
	<svg viewBox="0 0 120 120" width={120} height={120} fill="none">
		<circle cx="60" cy="60" r="45" stroke="white" strokeWidth="3" />
		<circle cx="60" cy="60" r="30" stroke="white" strokeWidth="2.5" strokeOpacity={0.7} />
		<circle cx="60" cy="60" r="15" stroke="white" strokeWidth="2" strokeOpacity={0.5} />
		<circle cx="60" cy="60" r="4" fill="white" />
		<line x1="60" y1="8" x2="60" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<line x1="60" y1="95" x2="60" y2="112" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<line x1="8" y1="60" x2="25" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" />
		<line x1="95" y1="60" x2="112" y2="60" stroke="white" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

// --- Card Data ---

interface CardData {
	icon: React.FC;
	label: string;
	gradientFrom: string;
	gradientTo: string;
	baseZ: number;
	offsetX: number;
	offsetY: number;
	exitStart: number;
	exitDuration: number;
}

const cards: CardData[] = [
	{
		icon: RobotIcon,
		label: 'Artificial Intelligence',
		gradientFrom: '#3b82f6',
		gradientTo: '#1d4ed8',
		baseZ: 60,
		offsetX: 0,
		offsetY: 0,
		exitStart: 30,
		exitDuration: 90,
	},
	{
		icon: BrainIcon,
		label: 'Machine Learning',
		gradientFrom: '#8b5cf6',
		gradientTo: '#6d28d9',
		baseZ: 0,
		offsetX: 30,
		offsetY: 15,
		exitStart: 150,
		exitDuration: 90,
	},
	{
		icon: TargetIcon,
		label: 'Goal-Directed Systems',
		gradientFrom: '#10b981',
		gradientTo: '#047857',
		baseZ: -60,
		offsetX: 60,
		offsetY: 30,
		exitStart: 270,
		exitDuration: 30,
	},
];

// --- Card Component ---

const Card: React.FC<{data: CardData}> = ({data}) => {
	const frame = useCurrentFrame();
	const {icon: Icon, label, gradientFrom, gradientTo, baseZ, offsetX, offsetY, exitStart, exitDuration} = data;

	// Entrance spring
	const entranceProgress = spring({
		frame,
		fps: FPS,
		config: {damping: 12, stiffness: 100, mass: 0.8},
	});
	const entranceScale = interpolate(entranceProgress, [0, 1], [0.8, 1]);
	const entranceOpacity = interpolate(entranceProgress, [0, 1], [0, 1]);

	// Exit animation
	const exitProgress = interpolate(
		frame,
		[exitStart, exitStart + exitDuration],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const exitScale = interpolate(exitProgress, [0, 1], [1, 0.6]);
	const exitTranslateZ = interpolate(exitProgress, [0, 1], [0, -300]);
	const exitTranslateX = interpolate(exitProgress, [0, 1], [0, -700]);
	const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 350]);
	const exitRotate = interpolate(exitProgress, [0, 1], [0, -15]);
	const exitOpacity = interpolate(exitProgress, [0, 0.6, 1], [1, 0.9, 0]);

	const scale = entranceScale * exitScale;
	const translateZ = baseZ + exitTranslateZ;
	const opacity = entranceOpacity * exitOpacity;

	return (
		<div
			style={{
				position: 'absolute',
				width: 400,
				height: 520,
				borderRadius: 24,
				background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
				boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 32,
				transform: `translate(${offsetX + exitTranslateX}px, ${offsetY + exitTranslateY}px) translateZ(${translateZ}px) rotate(${exitRotate}deg) scale(${scale})`,
				opacity,
			}}
		>
			<Icon />
			<div
				style={{
					color: 'white',
					fontSize: 28,
					fontWeight: 600,
					fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
					letterSpacing: '-0.02em',
					textAlign: 'center',
					padding: '0 24px',
				}}
			>
				{label}
			</div>
		</div>
	);
};

// --- Main Composition ---

export const CardStack3D: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(135deg, #0f172a, #1e293b)',
			}}
		>
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					perspective: 1200,
				}}
			>
				<div
					style={{
						position: 'relative',
						width: 400,
						height: 520,
						transformStyle: 'preserve-3d',
					}}
				>
					{/* Render back-to-front so CSS paint order is correct */}
					{[...cards].reverse().map((card, i) => (
						<Card key={i} data={card} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

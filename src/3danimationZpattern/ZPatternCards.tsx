import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';

const FPS = 30;

interface CardConfig {
	translateX: number;
	translateZ: number;
	rotateY: number;
	entranceDelay: number;
	gradientFrom: string;
	gradientTo: string;
}

const cardConfigs: CardConfig[] = [
	{
		// Card 1: far back, left side, faces viewer
		translateX: -280,
		translateZ: -200,
		rotateY: 0,
		entranceDelay: 0,
		gradientFrom: '#3b82f6',
		gradientTo: '#1d4ed8',
	},
	{
		// Card 2: middle, angled toward viewer
		translateX: 0,
		translateZ: 0,
		rotateY: -40,
		entranceDelay: 45,
		gradientFrom: '#2563eb',
		gradientTo: '#1e40af',
	},
	{
		// Card 3: closest to viewer, right side, faces viewer
		translateX: 280,
		translateZ: 200,
		rotateY: 0,
		entranceDelay: 90,
		gradientFrom: '#60a5fa',
		gradientTo: '#3b82f6',
	},
];

const Card: React.FC<{config: CardConfig}> = ({config}) => {
	const frame = useCurrentFrame();
	const {translateX, translateZ, rotateY, entranceDelay, gradientFrom, gradientTo} = config;

	const delayedFrame = Math.max(0, frame - entranceDelay);

	// Spring for smooth entrance
	const entranceProgress = spring({
		frame: delayedFrame,
		fps: FPS,
		config: {damping: 14, stiffness: 80, mass: 1},
	});

	// Slide in from 1200px to the right of final position
	const slideX = interpolate(entranceProgress, [0, 1], [1200, 0]);
	const opacity = interpolate(entranceProgress, [0, 1], [0, 1]);

	return (
		<div
			style={{
				position: 'absolute',
				width: 340,
				height: 460,
				borderRadius: 20,
				background: `linear-gradient(160deg, ${gradientFrom}, ${gradientTo})`,
				boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				transform: `translateX(${translateX + slideX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
				opacity,
				border: '1px solid rgba(255, 255, 255, 0.1)',
			}}
		>
			<div
				style={{
					color: 'white',
					fontSize: 32,
					fontWeight: 700,
					fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
					letterSpacing: '-0.02em',
					textAlign: 'center',
					padding: '0 32px',
					textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
				}}
			>
				[YOUR TEXT]
			</div>
		</div>
	);
};

export const ZPatternCards: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
			}}
		>
			{/* Subtle grid overlay */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					backgroundImage:
						'radial-gradient(circle, rgba(59, 130, 246, 0.06) 1px, transparent 1px)',
					backgroundSize: '40px 40px',
				}}
			/>
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
						width: 340,
						height: 460,
						transformStyle: 'preserve-3d',
					}}
				>
					{/* Render back-to-front for correct paint order */}
					{[...cardConfigs].reverse().map((config, i) => (
						<Card key={i} config={config} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

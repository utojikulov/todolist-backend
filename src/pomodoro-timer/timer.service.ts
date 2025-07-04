import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { PomodoroRoundDto, PomodoroSessionDto } from './timer.dto'
import { argv0 } from 'node:process'

@Injectable()
export class PomodoroService {
	constructor(private prisma: PrismaService) {}
	async getTodaySession(userId: string) {
		const today = new Date().toISOString().split('T')[0]

		return this.prisma.pomodoroSession.findFirst({
			where: {
				createdAt: {
					gte: new Date(today)
				},
				userId
			},
			include: {
				rounds: {
					orderBy: {
						id: 'desc'
					}
				}
			}
		})
	}

	async create(userId: string) {
		const todaySession = await this.getTodaySession(userId)

		if (todaySession) return todaySession

		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				intervalsCount: true
			}
		})

		if (!user) throw new NotFoundException('User not found.')

		const intervalsCount = user.intervalsCount ?? 0

		return this.prisma.pomodoroSession.create({
			data: {
				rounds: {
					createMany: {
						data: Array.from({ length: intervalsCount }, () => ({
							totalSeconds: 0
						}))
					}
				},
				user: {
					connect: {
						id: userId
					}
				}
			},
			include: {
				rounds: true
			}
		})
	}

	async update(
		dto: Partial<PomodoroSessionDto>,
		userId: string,
		pomodoroId: string
	) {
		const session = await this.prisma.pomodoroSession.findUnique({
			where: { id: pomodoroId }
		})

		if (!session || session.userId !== userId) {
			throw new NotFoundException('Pomodoro Session not found')
		}

		return this.prisma.pomodoroSession.update({
			where: {
				id: pomodoroId
			},
			data: dto
		})
	}

	async updateRound(dto: Partial<PomodoroRoundDto>, roundId: string) {
		return this.prisma.pomodoroRound.update({
			where: {
				id: roundId
			},
			data: dto
		})
	}

	async deleteSession(sessionId: string, userId: string) {
		return this.prisma.pomodoroSession.delete({
			where: {
				id: sessionId,
				userId
			}
		})
	}
}

import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { PomodoroService } from './timer.service'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { PomodoroRoundDto, PomodoroSessionDto } from './timer.dto'

@Controller('user/timer')
export class PomodoroController {
	constructor(private readonly pomodoroService: PomodoroService) {}

	@Get('today')
	@Auth()
	async getTodaySession(@CurrentUser('id') userId: string) {
		return this.pomodoroService.getTodaySession(userId)
	}

	@HttpCode(200)
	@Post()
	@Auth()
	async create(@CurrentUser('id') userId: string) {
		return this.pomodoroService.create(userId)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put('/round/:id')
	@Auth()
	async updateRound(@Body() dto: PomodoroRoundDto, @Param('id') id: string) {
		return this.pomodoroService.updateRound(dto, id)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put(':id')
	@Auth()
	async update(
		@Body() dto: PomodoroSessionDto,
		@CurrentUser('id') userId: string,
		@Param('id') id: string
	) {
		return this.pomodoroService.update(dto, userId, id)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth()
	async deleteSession(
		@Param('id') id: string,
		@CurrentUser('id') userId: string
	) {
		return this.pomodoroService.deleteSession(id, userId)
	}
}
